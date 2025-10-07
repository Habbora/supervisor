import type { NextConfig } from "next";

const API_URL = process.env.API_URL || 'http://localhost:4001';

const nextConfig: NextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${API_URL}/api/v1/:path*`,
            },
        ];
    },
};

export default nextConfig;