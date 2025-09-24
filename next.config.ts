
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ajout de la sortie standalone pour le déploiement sur Firebase Functions
  output: 'standalone',
  
  // Configuration pour le service des images
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
