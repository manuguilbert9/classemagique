
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ajout de la sortie standalone pour le déploiement sur Firebase Functions
  output: 'standalone',

  // Configuration pour le service des images
  images: {
    unoptimized: false,
  },

  // Assurer que les assets publics sont bien copiés dans le standalone
  outputFileTracingIncludes: {
      '/': ['./public/**/*'],
  },
};

export default nextConfig;
