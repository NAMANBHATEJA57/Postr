/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.s3.amazonaws.com",
            },
            {
                protocol: "https",
                hostname: "*.s3.*.amazonaws.com",
            },
        ],
    },
    // Performance: disable powered-by header
    poweredByHeader: false,
};

module.exports = nextConfig;
