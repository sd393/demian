/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    '@ffmpeg-installer/ffmpeg',
    'fluent-ffmpeg',
  ],
}

export default nextConfig
