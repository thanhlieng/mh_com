/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextTranslate = require('next-translate');

module.exports = {
  // eslint: {
  //   dirs: ['src'],
  // },

  // env: {
  //   NEXT_PUBLIC_API_HOST: 'http://localhost:3000',
  // },

  // Proxy mọi request không khớp page Next.js sang backend nội bộ.
  // Trình duyệt gọi https://mhgreatsun.com/..., Next.js forward tới backend-mh:3000
  // qua mạng nội bộ → backend không lộ ra Internet.
  async rewrites() {
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://backend-mh:3000/:path*',
        },
        {
          source: '/mhvn/:path*',
          destination: 'http://backend-mh:3000/api/:path*',
        },
        {
          source: '/media/:path*',
          destination: 'https://mhgreatsun.vn/media/:path*',
        },
      ],
    };
  },

  output: 'standalone',

  reactStrictMode: true,
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    localeDetection: false,
  },

  // Uncoment to add domain whitelist
  // images: {
  //   domains: [
  //     'acf-vn.s3.ap-southeast-1.amazonaws.com',
  //     'res.cloudinary.com',
  //     'logodix.com',
  //   ],
  // },

  // SVGR
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            typescript: true,
            icon: true,
          },
        },
      ],
    });

    return config;
  },

  ...nextTranslate(),
};
