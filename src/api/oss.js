import request from "../utils/request";

// OSS API wrappers (follow the interfaces that worked in testing)
// Note: STS/init require 'User-Id' header. We accept userId as param.

const getSts = async (userId) => {
  const res = await request.get("/oss/sts-token", {}, {
    headers: { "User-Id": String(userId || "") },
  });
  return res?.data || res; // interceptor already returns res
};

// Use snake_case body as per the successful request you validated
const initMultipart = async ({ fileName, fileSize, totalParts = 1, contentType, userId }) => {
  const body = {
    file_name: fileName,
    file_size: fileSize,
    total_parts: totalParts,
  };
  if (contentType) body.content_type = contentType;
  if (userId) body.user_id = String(userId);

  const res = await request.post("/oss/multipart/init", body, {
    headers: { "User-Id": String(userId || "") },
  });
  return res; // { code, message, data: { object_key, upload_id?, chunk_size? } }
};

export default {
  getSts,
  initMultipart,
};
