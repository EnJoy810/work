import OSS from "ali-oss";
import ossApi from "../api/oss";

function buildClientConfig(sts) {
  const cfg = {
    accessKeyId: sts.access_key_id,
    accessKeySecret: sts.access_key_secret,
    stsToken: sts.security_token,
  };
  if (sts.endpoint) {
    const ep = /^https?:\/\//i.test(sts.endpoint) ? sts.endpoint : `https://${sts.endpoint}`;
    try {
      const u = new URL(ep);
      if (sts.bucket && u.hostname.startsWith(`${sts.bucket}.`)) {
        cfg.endpoint = ep;
        cfg.cname = true;
        cfg.bucket = sts.bucket;
      } else {
        cfg.endpoint = ep;
        cfg.bucket = sts.bucket;
      }
    } catch {
      cfg.endpoint = ep;
      cfg.bucket = sts.bucket;
    }
  } else if (sts.region) {
    cfg.region = /^oss-/.test(sts.region) ? sts.region : `oss-${sts.region}`;
    cfg.bucket = sts.bucket;
  }
  return cfg;
}

export async function uploadWithInit(file, { userId, contentType, channel, bucketName } = {}) {
  const channelToUse = channel || "grading";
  const sts = await ossApi.getSts(userId, channelToUse);
  // 若是 communication 通道且未显式传入 bucketName，则使用 STS 返回的 bucket
  const bucketNameToUse = bucketName || (channelToUse === "communication" ? (sts.bucket || sts.bucket_name) : undefined);
  const initRes = await ossApi.initMultipart({
    fileName: file.name,
    fileSize: file.size,
    totalParts: 1,
    contentType: contentType || file.type || "application/octet-stream",
    userId,
    channel: channelToUse,
    bucketName: bucketNameToUse,
  });
  const objectKey = initRes?.data?.object_key || initRes?.data?.objectKey;
  if (!objectKey) throw new Error("init 未返回 object_key");

  const client = new OSS(buildClientConfig(sts));
  const putRes = await client.put(objectKey, file, {
    headers: {
      "Content-Type": contentType || file.type || "application/octet-stream",
    },
  });
  const etag = putRes?.etag || putRes?.res?.headers?.etag;
  return { objectKey, etag };
}
