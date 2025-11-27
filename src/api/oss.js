import request from "../utils/request";

// OSS API wrappers (follow the interfaces that worked in testing)
// Note: STS/init require 'User-Id' header. We accept userId as param.

const getSts = async (userId, channel = "grading") => {
  const res = await request.get(`/oss/sts-token/${channel}`, {}, {
    headers: { "User-Id": String(userId || "") },
  });
  return res?.data || res; // interceptor already returns res
};

// Use snake_case body as per the successful request you validated
const initMultipart = async ({ fileName, fileSize, totalParts = 1, contentType, userId, channel = "grading", bucketName }) => {
  const body = {
    file_name: fileName,
    file_size: fileSize,
    total_parts: totalParts,
  };
  if (contentType) body.content_type = contentType;
  if (userId) body.owner_id = String(userId);
  if (bucketName) body.bucketName = bucketName; // camelCase per backend 8082 spec

  // POST to /oss/multipart/init/{channel}
  const res = await request.post(`/oss/multipart/init/${channel}`, body, {
    headers: { "User-Id": String(userId || "") },
  });
  return res; // { code, message, data: { object_key, upload_id?, chunk_size? } }
};

export default {
  getSts,
  initMultipart,
};
