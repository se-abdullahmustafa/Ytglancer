/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [],
    },
    // Enable SWC minification for faster builds
    swcMinify: true,
}

module.exports = nextConfig
