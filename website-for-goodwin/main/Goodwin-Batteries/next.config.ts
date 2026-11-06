import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/warranty-registration',
        destination: '/support/warranty-registration',
        permanent: true,
      },
      {
        source: '/warranty/registration',
        destination: '/support/warranty-registration',
        permanent: true,
      },
      {
        source: '/register-warranty',
        destination: '/support/warranty-registration',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/account/login',
        permanent: false,
      },
      {
        source: '/account',
        destination: '/account/login',
        permanent: false,
      },
      {
        source: '/signin',
        destination: '/account/login',
        permanent: false,
      },
      {
        source: '/sign-in',
        destination: '/account/login',
        permanent: false,
      },
      {
        source: '/customer-login',
        destination: '/account/login',
        permanent: false,
      },
      {
        source: '/customer/login',
        destination: '/account/login',
        permanent: false,
      },
      {
        source: '/my-account',
        destination: '/account/orders',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
