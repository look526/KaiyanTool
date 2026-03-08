export const compressionConfig = {
  images: {
    webp: { quality: 80 },
    jpeg: { quality: 85 },
    png: { quality: 90 },
  },
  css: {
    minify: true,
  },
  js: {
    minify: true,
    treeShake: true,
  },
}
