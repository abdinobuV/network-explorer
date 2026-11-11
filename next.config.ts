import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * Aplikasi memakai:
 *  - Firebase Auth (popup Google + REST identitytoolkit) dan Firestore
 *  - YouTube-nocookie untuk video materi
 *  - next/font/local (font diserve dari domain sendiri, tidak ada CDN font)
 *
 * `unsafe-inline` pada script/style diperlukan karena Next.js menyuntikkan
 * script bootstrap secara inline. `unsafe-eval` hanya untuk mode development.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://apis.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://www.youtube.com https://i.ytimg.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com${isDev ? " ws: http:" : ""}`,
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://*.firebaseapp.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Next.js 16 memblokir permintaan dev lintas-origin. Daftar origins ini
  // agar aplikasi bisa dibuka lewat 127.0.0.1 atau alamat IP LAN saat
  // sedang mengembangkan (tidak berlaku untuk build produksi).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Service worker harus selalu dicek ulang agar update langsung dipakai.
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
