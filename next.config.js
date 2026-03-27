/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  // images: {
  //   domains: ['localhost', 'tiki-image.s3.us-east-2.amazonaws.com'],

  //   // domains: ['3.15.203.164', 'tiki-image.s3.us-east-2.amazonaws'],
  // },

  transpilePackages: ['react-audio-voice-recorder'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tiki-image.s3.us-east-2.amazonaws',
      },
    ],
  },
  // async redirects() {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/admin/login',
  //       permanent: true,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;
