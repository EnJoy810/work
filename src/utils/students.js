export function getClassStudentName(student, fallbackIndex = 0) {
  const nameCandidate =
    student?.student_name ||
    student?.studentName ||
    student?.name ||
    student?.displayName ||
    student?.real_name ||
    student?.realName ||
    student?.full_name ||
    student?.fullName ||
    student?.nickname ||
    student?.nick_name;
  if (nameCandidate && String(nameCandidate).trim()) {
    return String(nameCandidate).trim();
  }
  const noCandidate =
    student?.student_no ||
    student?.studentNo ||
    student?.student_code ||
    student?.studentCode ||
    student?.exam_no ||
    student?.examNo;
  if (noCandidate && String(noCandidate).trim()) {
    return String(noCandidate).trim();
  }
  return `学生${fallbackIndex + 1}`;
}

export function getClassStudentNo(student) {
  return (
    student?.student_no ||
    student?.studentNo ||
    student?.student_code ||
    student?.studentCode ||
    student?.student_id ||
    student?.studentId ||
    student?.exam_no ||
    student?.examNo ||
    student?.paper_id ||
    student?.paperId ||
    student?.enrollment_no ||
    student?.enrollmentNo ||
    student?.account ||
    ""
  );
}

export function getClassStudentKey(student, index) {
  const keyCandidate =
    student?._rowKey ||
    student?.classStudentId ||
    student?.class_student_id ||
    student?.id ||
    student?.student_id ||
    student?.studentId ||
    student?.binding_id ||
    student?.bindingId ||
    student?.student_no ||
    student?.studentNo ||
    student?.paper_id ||
    student?.paperId ||
    student?.exam_no ||
    student?.examNo;
  if (keyCandidate !== undefined && keyCandidate !== null && keyCandidate !== "") {
    return String(keyCandidate);
  }
  return `idx-${index}`;
}

function toPaperId(item) {
  const id =
    item?.paperId ||
    item?.paper_id ||
    item?.studentNo ||
    item?.student_no ||
    item?.id;
  return id != null && id !== "" ? String(id) : null;
}

function normalizeStatus(status) {
  const s = String(status ?? "").toLowerCase();
  if (s === "正常" || s === "normal" || s === "0" || s === "matched") return "normal";
  if (s === "异常" || s === "abnormal" || s === "1" || s === "exceptional") return "abnormal";
  return "normal";
}

export function mergeStudents({ classStudents, v2Data, answerSheets, manualMatchedSet }) {
  const classStudentsList = Array.isArray(classStudents) ? classStudents : [];
  const v2Normal = Array.isArray(v2Data?.normal) ? v2Data.normal : [];
  const v2Abnormal = Array.isArray(v2Data?.abnormal) ? v2Data.abnormal : [];
  const v2Exceptional = Array.isArray(v2Data?.exceptional) ? v2Data.exceptional : [];
  const v2Absent = Array.isArray(v2Data?.absent) ? v2Data.absent : [];
  const v2List = [...v2Normal, ...v2Abnormal, ...v2Exceptional];

  const answerSheetMap = new Map();
  if (Array.isArray(answerSheets)) {
    for (const item of answerSheets) {
      const pid = toPaperId(item);
      if (pid) answerSheetMap.set(pid, item);
    }
  }

  const merged = [];

  for (const v2Item of v2List) {
    const paperId = toPaperId(v2Item);
    if (!paperId) continue;
    const statusRaw = v2Item.status ?? v2Item.result_status ?? v2Item.review_status ?? "正常";
    const norm = normalizeStatus(statusRaw);
    const answerSheet = answerSheetMap.get(paperId) || v2Item;
    const isManual = manualMatchedSet?.has(paperId) || false;
    const isNormal = isManual || norm === "normal";
    const isAbnormal = !isNormal && norm === "abnormal";

    if (isNormal) {
      const matchedClassStudent = classStudentsList.find(
        (cs) =>
          (cs?.student_name === v2Item?.studentName || cs?.student_name === v2Item?.student_name) &&
          (cs?.student_no === v2Item?.studentNo || cs?.student_no === v2Item?.student_no)
      ) || null;
      merged.push({
        type: "matched",
        classStudent: matchedClassStudent,
        answerSheet,
        v2Data: v2Item,
        paperId,
        status: "正常",
        displayName: matchedClassStudent?.student_name || v2Item?.studentName || v2Item?.student_name || "未知",
        recognizedName: v2Item?.studentName || v2Item?.student_name,
        recognizedNo: v2Item?.studentNo || v2Item?.student_no,
        score: v2Item?.totalScore ?? v2Item?.total_score ?? answerSheet?.score,
        nameImageUrl: v2Item?.student_name_img_url || answerSheet?.student_name_img_url || "",
      });
    } else if (isAbnormal) {
      merged.push({
        type: "abnormal",
        classStudent: null,
        answerSheet,
        v2Data: v2Item,
        paperId,
        status: "异常",
        displayName: v2Item?.studentName || v2Item?.student_name || "未知",
        recognizedName: v2Item?.studentName || v2Item?.student_name,
        recognizedNo: v2Item?.studentNo || v2Item?.student_no,
        score: v2Item?.totalScore ?? v2Item?.total_score ?? answerSheet?.score,
        nameImageUrl: v2Item?.student_name_img_url || answerSheet?.student_name_img_url || "",
      });
    }
  }

  for (const absentItem of v2Absent) {
    const matchedClassStudent = classStudentsList.find(
      (cs) =>
        String(cs?.student_no ?? cs?.studentNo ?? "") === String(absentItem?.student_no ?? "") ||
        String(cs?.student_name ?? cs?.studentName ?? "") === String(absentItem?.student_name ?? "")
    ) || null;
    merged.push({
      type: "absent",
      classStudent: matchedClassStudent,
      answerSheet: null,
      v2Data: absentItem,
      paperId: null,
      status: "缺考",
      displayName:
        matchedClassStudent?.student_name || matchedClassStudent?.studentName || absentItem?.student_name || "未知",
      recognizedName: null,
      recognizedNo: null,
      score: absentItem?.score || 0,
      nameImageUrl: absentItem?.student_name_img_url || "",
    });
  }

  const typeOrder = { matched: 0, abnormal: 1, absent: 2 };
  merged.sort((a, b) => {
    const td = (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
    if (td !== 0) return td;
    const an = a.displayName || "";
    const bn = b.displayName || "";
    return an.localeCompare(bn, "zh");
  });

  return merged;
}
