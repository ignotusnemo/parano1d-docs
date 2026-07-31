/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
