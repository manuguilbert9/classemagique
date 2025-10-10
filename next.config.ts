
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ajout de la sortie standalone pour le déploiement sur Firebase Functions
  output: 'standalone',

  // Configuration pour le service des images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/v0/b/classemagique2.appspot.com/**',
      },
    ],
  },

  // Configuration pour améliorer la stabilité des Server Actions
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
