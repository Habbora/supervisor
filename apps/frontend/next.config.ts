import type { NextConfig } from "next";

const API_URL = process.env.API_URL || 'http://localhost:4000';

console.log('API_URL:', API_URL);

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `http://localhost:4000/api/v1/:path*`,
            },
        ];
    },
};

export default nextConfig;