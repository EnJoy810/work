import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Space, Typography, Tag, List, Input } from "antd";
import "./traceMock.css";

const LS_KEY = "trace-mock-traces";
const UI_KEY = "trace-mock-ui";

const mock = {
  studentNo: "S001",
  status: 200,
  questions: [
    { questionId: "Q1", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.12, y: 0.18, width: 0.60, height: 0.12 }, rtp: { x: 0.65, y: 0.20 }, status: 200 },
    { questionId: "Q2", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.10, y: 0.32, width: 0.66, height: 0.11 }, rtp: { x: 0.72, y: 0.36 }, status: 5001 },
    { questionId: "Q3", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.08, y: 0.46, width: 0.68, height: 0.12 }, rtp: null, status: 4002 },
    { questionId: "Q4", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.14, y: 0.60, width: 0.58, height: 0.12 }, rtp: { x: 0.66, y: 0.64 }, status: 200 },
    { questionId: "Q5", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.12, y: 0.74, width: 0.62, height: 0.12 }, rtp: { x: 0.70, y: 0.78 }, status: 200 },
    { questionId: "Q6", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.10, y: 0.12, width: 0.64, height: 0.12 }, rtp: null, status: 4001 },
    { questionId: "Q7", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.16, y: 0.26, width: 0.56, height: 0.12 }, rtp: { x: 0.68, y: 0.30 }, status: 5001 },
    { questionId: "Q8", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.11, y: 0.40, width: 0.63, height: 0.12 }, rtp: { x: 0.73, y: 0.44 }, status: 200 },
    { questionId: "Q9", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.09, y: 0.54, width: 0.67, height: 0.12 }, rtp: null, status: 4003 },
    { questionId: "Q10", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.13, y: 0.68, width: 0.59, height: 0.12 }, rtp: { x: 0.69, y: 0.72 }, status: 200 },
    { questionId: "Q11", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.15, y: 0.82, width: 0.55, height: 0.12 }, rtp: { x: 0.74, y: 0.86 }, status: 5001 },
    { questionId: "Q12", answer_photo_url: "https://public-graderscape-test.oss-cn-shenzhen.aliyuncs.com/grading/1762963330_王紫莹_18.jpg", bbox: { x: 0.10, y: 0.06, width: 0.65, height: 0.12 }, rtp: null, status: 4002 },
  ],
};

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function initPointFromRtp(bbox, rtp, status) {
  const ok =
    rtp &&
    (status === 200 || status === 5001) &&
    rtp.x >= bbox.x &&
    rtp.x <= bbox.x + bbox.width &&
    rtp.y >= bbox.y &&
    rtp.y <= bbox.y + bbox.height;
  if (ok) {
    return {
      x: (rtp.x - bbox.x) / bbox.width,
      y: (rtp.y - bbox.y) / bbox.height,
    };
  }
  return { x: 0.9, y: 0.1 };
}

export default function TraceMockPage() {
  const [idx, setIdx] = useState(0);
  const q = mock.questions[idx];
  const imgRef = useRef(null);
  const [imgRect, setImgRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [traces, setTraces] = useState(() => {
    try {
      const txt = localStorage.getItem(LS_KEY);
      const parsed = txt ? JSON.parse(txt) : {};
      // 兼容老版本：将 {questionId:{x,y,comment}} 转为 {questionId:[{id,x,y,comment}]}
      const upgraded = {};
      Object.keys(parsed || {}).forEach((k) => {
        const v = parsed[k];
        if (Array.isArray(v)) upgraded[k] = v;
        else if (v && typeof v === "object") upgraded[k] = [{ id: `${k}-t1`, x: v.x ?? 0.9, y: v.y ?? 0.1, comment: v.comment || "" }];
      });
      return upgraded;
    } catch {
      return {};
    }
  });

  const uiInit = (() => {
    try {
      const t = localStorage.getItem(UI_KEY);
      return t ? JSON.parse(t) : { left: true, right: true };
    } catch {
      return { left: true, right: true };
    }
  })();
  const [showLeft, setShowLeft] = useState(uiInit.left);
  const [showRight, setShowRight] = useState(uiInit.right);

  // 当前题的 traces 列表
  const currentTraces = useMemo(() => traces[q.questionId] || [], [traces, q.questionId]);
  const [selectedId, setSelectedId] = useState(() => currentTraces[0]?.id || null);
  const [draggingId, setDraggingId] = useState(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setImgRect({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [idx]);

  useEffect(() => {
    const list = traces[q.questionId];
    if (Array.isArray(list) && list.length > 0) {
      setSelectedId((prev) => (list.some((t) => t.id === prev) ? prev : list[0].id));
    } else {
      // 若当前题没有 trace，创建一个默认落点
      const init = initPointFromRtp(q.bbox, q.rtp, q.status);
      const first = { id: `${q.questionId}-t${Date.now()}`, x: init.x, y: init.y, comment: "" };
      const next = { ...traces, [q.questionId]: [first] };
      setTraces(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      setSelectedId(first.id);
    }
  }, [idx, q.questionId, q.bbox, q.rtp, q.status, traces]);

  function persistForQuestion(list) {
    const n = { ...traces, [q.questionId]: list };
    setTraces(n);
    localStorage.setItem(LS_KEY, JSON.stringify(n));
  }

  function onMouseDownFor(id) {
    return (e) => {
      e.preventDefault();
      setDraggingId(id);
      setSelectedId(id);
    };
  }
  function onMouseUp() {
    setDraggingId(null);
  }
  function onMouseMove(e) {
    if (!draggingId) return;
    const x = clamp01((e.clientX - imgRect.left) / (imgRect.width || 1));
    const y = clamp01((e.clientY - imgRect.top) / (imgRect.height || 1));
    const list = (traces[q.questionId] || []).map((t) => (t.id === draggingId ? { ...t, x, y } : t));
    persistForQuestion(list);
  }

  function prev() {
    setIdx((p) => Math.max(0, p - 1));
  }
  function next() {
    setIdx((p) => Math.min(mock.questions.length - 1, p + 1));
  }

  function persistUi(left, right) {
    try {
      localStorage.setItem(UI_KEY, JSON.stringify({ left, right }));
    } catch (e) { void e; }
  }
  function toggleLeft() {
    const nl = !showLeft;
    setShowLeft(nl);
    persistUi(nl, showRight);
  }
  function toggleRight() {
    const nr = !showRight;
    setShowRight(nr);
    persistUi(showLeft, nr);
  }

  function exportJson() {
    const arr = mock.questions.flatMap((qq) => {
      const list = traces[qq.questionId];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((t) => ({
          questionId: qq.questionId,
          type: "circle",
          relativeX: t.x,
          relativeY: t.y,
          comment: t.comment || "",
        }));
      }
      const init = initPointFromRtp(qq.bbox, qq.rtp, qq.status);
      return [{ questionId: qq.questionId, type: "circle", relativeX: init.x, relativeY: init.y, comment: "" }];
    });
    const blob = new Blob([JSON.stringify(arr, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "traces-mock.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const statusColor = useMemo(() => {
    if (q.status === 200) return "#1677ff";
    if (q.status === 5001) return "#faad14";
    return "#ff4d4f";
  }, [q.status]);

  return (
    <div className="trace-mock" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div className="trace-mock__header">
        <Typography.Text className="trace-mock__title">留痕（Mock）</Typography.Text>
        <Tag color="blue">{q.questionId}</Tag>
        <Tag color={q.status === 200 ? "blue" : q.status === 5001 ? "gold" : "red"}>{q.status}</Tag>
        <Typography.Text type="secondary">{idx + 1}/{mock.questions.length}</Typography.Text>
        <Space size={8}>
          <Button onClick={prev} disabled={idx === 0}>上一题</Button>
          <Button onClick={next} disabled={idx === mock.questions.length - 1}>下一题</Button>
          <Button type="primary" onClick={exportJson}>导出留痕JSON</Button>
        </Space>
        <span style={{ flex: 1 }} />
        <Space size={8}>
          <Button onClick={toggleLeft}>{showLeft ? "隐藏左栏" : "显示左栏"}</Button>
          <Button onClick={toggleRight}>{showRight ? "隐藏右栏" : "显示右栏"}</Button>
        </Space>
      </div>
      <div className="trace-mock__body">
        {showLeft && (
          <div className="trace-mock__left">
            <Typography.Text strong>题目列表</Typography.Text>
            <List
              size="small"
              dataSource={mock.questions}
              renderItem={(item, i) => (
                <List.Item
                  onClick={() => setIdx(i)}
                  style={{
                    cursor: "pointer",
                    background: i === idx ? "#e6f4ff" : undefined,
                    borderRadius: 6,
                  }}
                >
                  <Space size={6}>
                    <Tag color="blue">{item.questionId}</Tag>
                    <Tag color={item.status === 200 ? "blue" : item.status === 5001 ? "gold" : "red"}>{item.status}</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </div>
        )}
        <div className="trace-mock__canvas">
          <Card className="trace-mock__canvas-card" bordered style={{ borderColor: statusColor }} bodyStyle={{ padding: 12 }}>
            <img
              ref={imgRef}
              src={q.answer_photo_url}
              alt={q.questionId}
              className="trace-mock__img"
              onDragStart={(e) => e.preventDefault()}
            />
            {(traces[q.questionId] || []).map((t) => (
              <div
                key={t.id}
                onMouseDown={onMouseDownFor(t.id)}
                className="trace-mock__dot"
                style={{
                  left: imgRect.width * t.x + 12 - 8,
                  top: imgRect.height * t.y + 12 - 8,
                  background: statusColor,
                  boxShadow: t.id === selectedId
                    ? "0 0 0 2px #fff, 0 0 0 6px rgba(22,119,255,0.45)"
                    : "0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.15)",
                }}
                title={`(${(t.x * 100).toFixed(1)}%, ${(t.y * 100).toFixed(1)}%)`}
              />
            ))}
          </Card>
        </div>
        {showRight && (
          <div className="trace-mock__right">
            <Space style={{ marginBottom: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  const init = initPointFromRtp(q.bbox, q.rtp, q.status);
                  const nt = { id: `${q.questionId}-t${Date.now()}`, x: init.x, y: init.y, comment: "" };
                  const list = [...(traces[q.questionId] || []), nt];
                  persistForQuestion(list);
                  setSelectedId(nt.id);
                }}
              >添加留痕</Button>
              <Button
                danger
                disabled={!selectedId}
                onClick={() => {
                  const list = (traces[q.questionId] || []).filter((t) => t.id !== selectedId);
                  persistForQuestion(list);
                  setSelectedId(list[0]?.id || null);
                }}
              >删除选中</Button>
            </Space>
            <List
              size="small"
              header={<Typography.Text strong>留痕列表</Typography.Text>}
              dataSource={traces[q.questionId] || []}
              renderItem={(t) => (
                <List.Item
                  onClick={() => setSelectedId(t.id)}
                  style={{ cursor: "pointer", background: t.id === selectedId ? "#e6f4ff" : undefined, borderRadius: 6 }}
                >
                  <Space>
                    <Tag color="blue">{t.id.split("-").pop()}</Tag>
                    <span>{`(${(t.x*100).toFixed(1)}%, ${(t.y*100).toFixed(1)}%)`}</span>
                  </Space>
                </List.Item>
              )}
            />
            <Typography.Text strong style={{ marginTop: 8 }}>评论内容</Typography.Text>
            <Input.TextArea
              value={(traces[q.questionId] || []).find((t) => t.id === selectedId)?.comment || ""}
              onChange={(e) => {
                const list = (traces[q.questionId] || []).map((t) => (t.id === selectedId ? { ...t, comment: e.target.value } : t));
                setTraces({ ...traces, [q.questionId]: list });
              }}
              onBlur={() => {
                const list = traces[q.questionId] || [];
                persistForQuestion(list);
              }}
              rows={6}
              placeholder="在此输入该留痕的评论"
            />
            <div className="trace-mock__status">
              <span>学生状态：</span>
              <Tag>{mock.status}</Tag>
            </div>
            <div className="trace-mock__status">
              <span>题目状态：</span>
              <Tag color={q.status === 200 ? "blue" : q.status === 5001 ? "gold" : "red"}>{q.status}</Tag>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
