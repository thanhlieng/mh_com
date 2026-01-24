/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextTranslate = require('next-translate');

module.exports = {
  // eslint: {
  //   dirs: ['src'],
  // },

  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: 'http://backend-mh:3000/:path*',
      },
    ];
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
