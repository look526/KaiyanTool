export const codeSplittingConfig = {
  manualChunks: {
    vendor: ['react', 'react-dom', 'react-router-dom'],
    query: ['@tanstack/react-query'],
    ui: ['framer-motion', 'lucide-react', 'class-variance-authority'],
    editor: ['@monaco-editor/react', 'monaco-editor'],
    analytics: ['@sentry/react', '@sentry/tracing'],
  },
  chunkSizeWarningLimit: 200,
}
