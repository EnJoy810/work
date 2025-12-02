import OSS from "ali-oss";
import ossApi from "../api/oss";

const PART_SIZE = 20 * 1024 * 1024;

// 生成文件唯一标识（用于断点续传）
function getFileKey(file) {
  return `upload_checkpoint_${file.name}_${file.size}_${file.lastModified}`;
}

// 保存断点信息到 localStorage
function saveCheckpoint(fileKey, checkpoint) {
  try {
    localStorage.setItem(fileKey, JSON.stringify(checkpoint));
  } catch (e) {
    console.warn("保存断点信息失败:", e);
  }
}

// 读取断点信息
function loadCheckpoint(fileKey) {
  try {
    const saved = localStorage.getItem(fileKey);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.warn("读取断点信息失败:", e);
    return null;
  }
}

// 清除断点信息
function clearCheckpoint(fileKey) {
  try {
    localStorage.removeItem(fileKey);
  } catch (e) {
    console.warn("清除断点信息失败:", e);
  }
}

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

/**
 * 生成 OSS objectKey 路径
 * @param {string} userId - 用户ID
 * @param {string} fileName - 文件名
 * @returns {string}
 */
function generateObjectKey(userId, fileName) {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const uuid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const ext = fileName.split('.').pop() || 'pdf';
  return `uploads/${userId}/${dateStr}/${uuid}.${ext}`;
}

/**
 * 分片上传（支持断点续传、进度回调和取消）
 * @param {File} file - 要上传的文件
 * @param {Object} options - 配置选项
 * @param {string} options.userId - 用户ID
 * @param {string} options.contentType - 文件类型
 * @param {string} options.channel - 上传通道
 * @param {Function} options.onProgress - 进度回调 (percent: number) => void
 * @param {AbortSignal} options.signal - 用于取消上传的信号
 * @returns {Promise<{objectKey: string, etag: string}>}
 */
export async function multipartUploadWithProgress(file, { userId, contentType, channel, onProgress, signal } = {}) {
  const channelToUse = channel || "grading";
  const fileKey = getFileKey(file);
  
  // 辅助函数：检查是否已取消
  const checkAborted = () => {
    if (signal?.aborted) {
      throw new Error("上传已取消");
    }
  };
  
  // 检查是否已取消
  checkAborted();
  
  // 获取 STS 凭证
  const sts = await ossApi.getSts(userId, channelToUse);
  
  // 获取凭证后再次检查
  checkAborted();
  
  // 生成 objectKey
  const objectKey = generateObjectKey(userId, file.name);

  // 创建 OSS 客户端
  const client = new OSS(buildClientConfig(sts));
  
  // 尝试恢复断点
  let checkpoint = loadCheckpoint(fileKey);
  
  // 再次检查
  checkAborted();
  
  // 监听取消信号
  let aborted = false;
  const abortHandler = () => {
    aborted = true;
    client.cancel();
  };
  signal?.addEventListener("abort", abortHandler);
  
  try {
    const result = await client.multipartUpload(objectKey, file, {
      partSize: PART_SIZE,
      checkpoint,
      progress: (percentage, cpt) => {
        // 检查是否已取消
        if (aborted) return;
        // 保存断点信息
        saveCheckpoint(fileKey, cpt);
        // 回调进度
        if (onProgress) {
          onProgress(Math.round(percentage * 100));
        }
      },
      headers: {
        "Content-Type": contentType || file.type || "application/pdf",
      },
    });
    
    // 上传成功，清除断点信息
    clearCheckpoint(fileKey);
    
    // 从结果中获取实际的 objectKey（SDK 可能会修改）
    const finalObjectKey = result?.name || objectKey;
    const etag = result?.etag || result?.res?.headers?.etag;
    return { objectKey: finalObjectKey, etag };
  } catch (error) {
    if (aborted) {
      throw new Error("上传已取消");
    }
    // 如果是用户取消或网络错误，保留断点信息以便续传
    console.error("分片上传失败:", error);
    throw error;
  } finally {
    signal?.removeEventListener("abort", abortHandler);
  }
}
