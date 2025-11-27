import OSS from "ali-oss";
import ossApi from "../api/oss";

/**
 * 上传视频到 OSS
 * @param {File} file - 视频文件
 * @param {string} userId - 用户 ID
 * @returns {Promise<string>} 视频 URL
 */
export async function uploadVideo(file, userId) {
  // 验证文件类型
  if (file.type !== 'video/mp4') {
    throw new Error('只支持 MP4 格式的视频');
  }

  // 验证文件大小（100MB）
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('视频大小不能超过 100MB');
  }

  // 1. 获取 STS 凭证（用于上传权限）
  const sts = await ossApi.getSts(userId, 'communication');
  
  // 2. 调用 init 接口获取 object_key
  const initRes = await ossApi.initMultipart({
    fileName: file.name,
    fileSize: file.size,
    totalParts: 1,
    contentType: 'video/mp4',
    userId,
    channel: 'communication',
    bucketName: sts.bucket || 'public-graderscape-test',
  });
  
  const objectKey = initRes?.data?.object_key || initRes?.data?.objectKey;
  if (!objectKey) {
    throw new Error('初始化上传失败：未返回 object_key');
  }

  // 3. 使用 STS 凭证创建 OSS 客户端并上传文件
  const ossClient = new OSS({
    accessKeyId: sts.access_key_id,
    accessKeySecret: sts.access_key_secret,
    stsToken: sts.security_token,
    bucket: sts.bucket || 'public-graderscape-test',
    region: sts.region || 'oss-cn-shenzhen',
    endpoint: sts.endpoint || 'oss-cn-shenzhen.aliyuncs.com',
  });
  
  await ossClient.put(objectKey, file, {
    headers: {
      'Content-Type': 'video/mp4',
    },
  });

  // 4. 构建公共访问 URL（无需签名，因为是公共读桶）
  const bucket = sts.bucket || 'public-graderscape-test';
  const endpoint = sts.endpoint || 'oss-cn-shenzhen.aliyuncs.com';
  const ossUrl = `https://${bucket}.${endpoint}/${objectKey}`;
  
  return ossUrl;
}

/**
 * 验证视频时长（可选）
 * @param {File} file - 视频文件
 * @param {number} maxDuration - 最大时长（秒），默认 300 秒（5分钟）
 * @returns {Promise<boolean>}
 */
export function validateVideoDuration(file, maxDuration = 300) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function() {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      
      if (duration > maxDuration) {
        reject(new Error(`视频时长不能超过 ${Math.floor(maxDuration / 60)} 分钟`));
      } else {
        resolve(true);
      }
    };

    video.onerror = function() {
      reject(new Error('无法读取视频信息'));
    };

    video.src = URL.createObjectURL(file);
  });
}
