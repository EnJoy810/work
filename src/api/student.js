import request from "../utils/request";

/**
 * 学生相关 API
 */

/**
 * 按班级获取学生列表
 * @param {string} [classId] - 班级ID，可选。默认从请求拦截器读取
 * @returns {Promise<{code: string, data: Array}>}
 */
export const getStudentsByClassId = (classId) => {
  const config = {};
  if (classId) {
    config.headers = {
      class_id: classId,
      "X-Current-Class": classId,
    };
  }
  return request.get("/student/list-by-classId", {}, config);
};

/**
 * 将对象键从 camelCase 转为 snake_case（浅转换）
 */
const toSnakeCasePayload = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const snake = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = key
      .replace(/([A-Z])/g, "_$1")
      .replace(/__/g, "_")
      .toLowerCase();
    snake[snakeKey] = obj[key];
  });
  return snake;
};

/**
 * 新增或更新学生
 * 后端以 PUT /api/student 实现 upsert
 * @param {Object} payload - 学生数据（前端可传 camelCase，本函数会转为 snake_case）
 * @returns {Promise}
 */
export const saveStudent = (payload, classId) => {
  const data = toSnakeCasePayload(payload);
  const config = {};
  if (classId) {
    config.headers = {
      class_id: classId,
      "X-Current-Class": classId,
    };
  }
  return request.post("/student", data, config);
};

export const updateStudent = (payload, classId) => {
  const data = toSnakeCasePayload(
    classId ? { ...payload, classId } : payload
  );
  return request.put("/student", data);
};

/**
 * 删除学生
 * @param {string} studentNo - 学号
 * @returns {Promise}
 */
export const deleteStudent = (studentNo) => {
  return request.delete("/student", { student_no: studentNo });
};

export default {
  getStudentsByClassId,
  saveStudent,
  updateStudent,
  deleteStudent,
};
