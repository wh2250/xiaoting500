import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 手机拍的照片比较大，放宽 Server Action 的上传体积限制（配合前端压缩）
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
