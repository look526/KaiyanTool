import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'
import contentRoutes from './routes/content.routes'
import assetRoutes from './routes/asset.routes'
import projectMemberRoutes from './routes/project-member.routes'
import uploadRoutes from './routes/upload.routes'
import aiProviderRoutes from './routes/ai-provider.routes'
import scriptRoutes from './routes/script.routes'
import novelRoutes from './routes/novel.routes'
import directorRoutes from './routes/director.routes'
import shotRoutes from './routes/shot.routes'
import shotGenerationRoutes from './routes/shot-generation.routes'
import panelRoutes from './routes/panel.routes'
import panelGenerationRoutes from './routes/panel-generation.routes'
import videoGenerationRoutes from './routes/video-generation.routes'
import nineGridRoutes from './routes/ninegrid.routes'
import exportRoutes from './routes/export.routes'
import auditRoutes from './routes/audit.routes'
import documentRoutes from './routes/document.routes'
import logger, { requestLogger } from './lib/logger'
import { initSentry, sentryRequestHandler, sentryErrorHandler, sentryTracingHandler } from './lib/sentry'
import { getMetrics } from './lib/metrics'
import { metricsMiddleware } from './middleware/metrics.middleware'
import { setupOpenTelemetry } from './config/opentelemetry'
// import { setupSwagger } from './lib/swagger'

// 初始化OpenTelemetry
setupOpenTelemetry()

initSentry()
const metrics = getMetrics()

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

app.use(sentryRequestHandler)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(UPLOAD_DIR))
app.use(sentryTracingHandler)
app.use(requestLogger)
app.use(metricsMiddleware)

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// setupSwagger(app)

app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', metrics.register.contentType)
  res.end(await metrics.register.metrics())
})

app.use('/api/auth', authRoutes)
app.use('/api', projectRoutes)
app.use('/api', contentRoutes)
app.use('/api', assetRoutes)
app.use('/api', projectMemberRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/ai-providers', aiProviderRoutes)
app.use('/api', scriptRoutes)
app.use('/api', novelRoutes)
app.use('/api', directorRoutes)
app.use('/api', shotRoutes)
app.use('/api', shotGenerationRoutes)
app.use('/api', panelRoutes)
app.use('/api', panelGenerationRoutes)
app.use('/api', videoGenerationRoutes)
app.use('/api', nineGridRoutes)
app.use('/api', exportRoutes)
app.use('/api', documentRoutes)
app.use('/api/audit', auditRoutes)

app.use(sentryErrorHandler)
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: (req as any).userId || 'anonymous'
  })
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
