export const cdnConfig = {
  enabled: process.env.NODE_ENV === 'production',
  baseUrl: process.env.CDN_URL || '',
  paths: {
    images: '/assets/images',
    fonts: '/assets/fonts',
    css: '/assets/css',
    js: '/assets/js',
  },
}
