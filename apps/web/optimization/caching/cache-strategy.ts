export const cacheStrategy = {
  static: {
    maxAge: 31536000,
    immutable: true,
  },
  api: {
    maxAge: 300,
    staleWhileRevalidate: true,
  },
  dynamic: {
    maxAge: 0,
    cacheControl: 'no-cache',
  },
}
