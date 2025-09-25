import type { NextConfig } from "next";

console.log("🔎 API_URL carregada:", process.env.API_URL);
const API_URL = process.env.API_URL || 'http://localhost:4002';

console.log("🔎 API_URL carregada do env:", API_URL);

const nextConfig: NextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        console.log("🔎 API_URL carregada do env 2:", API_URL);
        return [
            {
                source: '/api/:path*',
                destination: `${API_URL}/api/v1/:path*`,
            },
        ];
    },
};

export default nextConfig;