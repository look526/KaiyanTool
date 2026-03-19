import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({path: ".env"})

import { config, validateConfig } from './config'

try {
  validateConfig()
} catch (error) {
  console.error('Configuration validation failed:', error instanceof Error ? error.message : error)
  process.exit(1)
}

import authRoutes from './routes/auth.routes'
import projectRoutes from './routes/project.routes'
import contentRoutes from './routes/content.routes'
import assetRoutes from './routes/asset.routes'
import projectMemberRoutes from './routes/project-member.routes'
import uploadRoutes from './routes/upload.routes'
import aiProviderRoutes from './routes/ai-provider.routes'
import modelPreferenceRoutes from './routes/model-preference.routes'
import scriptRoutes from './routes/script.routes'
import novelRoutes from './routes/novel.routes'
import directorRoutes from './routes/director.routes'
import storylineRoutes from './routes/storyline.routes'
import outlineRoutes from './routes/outline.routes'
import shotRoutes from './routes/shot.routes'
import shotGenerationRoutes from './routes/shot-generation.routes'
import panelRoutes from './routes/panel.routes'
import panelGenerationRoutes from './routes/panel-generation.routes'
import videoGenerationRoutes from './routes/video-generation.routes'
import nineGridRoutes from './routes/ninegrid.routes'
import exportRoutes from './routes/export.routes'
import auditRoutes from './routes/audit.routes'
import documentRoutes from './routes/document.routes'
import analyticsRoutes from './routes/analytics.routes'
import agentStreamRoutes from './routes/agent-stream.routes'
import agentRoutes from './routes/agent.routes'
import promptTemplateRoutes from './routes/prompt-template.routes'
import promptRoutes from './routes/prompt.routes'
import projectSettingsRoutes from './routes/project-settings.routes'
import chatHistoryRoutes from './routes/chat-history.routes'
import itemRoutes from './routes/item.routes'
import healthRoutes from './routes/health.routes'
import assistantRoutes from './routes/assistant.routes'
import adminRoutes from './routes/admin'
import imageGenerationRoutes from './routes/image-generation.routes'
import imageEnhancementRoutes from './routes/image-enhancement.routes'
import contentProcessRoutes from './routes/content-process.routes'
import episodeRoutes from './routes/episode.routes'
import sceneRoutes from './routes/scene.routes'
import shotAlternativeRoutes from './routes/shot-alternative.routes'
import shotDraftRoutes from './routes/shot-draft.routes'
import mentionRoutes from './routes/mention.routes'
import ttsRoutes from './routes/tts.routes'
import subtitleRoutes from './routes/subtitle.routes'
import timelineRoutes from './routes/timeline.routes'
import productionRoutes from './routes/production.routes'
import logger, { requestLogger } from './lib/logger'
import { initSentry, sentryRequestHandler, sentryErrorHandler, sentryTracingHandler } from './lib/sentry'
import { getMetrics } from './lib/metrics'
import { metricsMiddleware } from './middleware/metrics.middleware'
import { setupOpenTelemetry } from './config/opentelemetry'
import { errorMiddleware, notFoundHandler } from './middleware/error.middleware'
import { responseCaseTransform } from './middleware/response-case-transform.middleware'
import { csrfMiddleware } from './middleware/csrf.middleware'

setupOpenTelemetry()

initSentry()
const metrics = getMetrics()

const app = express()
const PORT = config.port
const UPLOAD_DIR = path.join(process.cwd(), config.upload.dir)

app.use(sentryRequestHandler)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (config.nodeEnv === 'development') {
      callback(null, true)
    } else if (config.cors.origins.includes(origin)) {
      callback(null, origin)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(UPLOAD_DIR))
app.use(sentryTracingHandler)
app.use(requestLogger)
app.use(metricsMiddleware)
app.use(responseCaseTransform)
app.use(csrfMiddleware)

app.use('/api/health', healthRoutes)

app.get('/api/metrics', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (config.cors.origins.includes(origin)) {
      callback(null, origin)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}), async (_req: Request, res: Response) => {
  res.set('Content-Type', metrics.register.contentType)
  res.end(await metrics.register.metrics())
})

app.post('/api/metrics', cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (config.cors.origins.includes(origin)) {
      callback(null, origin)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}), (req: Request, res: Response) => {
  try {
    const { name, value, labels } = req.body
    if (!name || value === undefined) {
      return res.status(400).json({ error: 'Invalid metric data: name and value are required' })
    }
    logger.debug('Received client metric', { name, value, labels })
    res.status(200).json({ success: true })
  } catch (error) {
    logger.error('Error processing metric', { error, body: req.body })
    res.status(500).json({ error: 'Failed to process metric' })
  }
})

// 先注册不需要认证的路由
app.use('/api/auth', authRoutes)

// 注册需要认证的路由
app.use('/api/projects', projectRoutes)
app.use('/api', contentRoutes)
app.use('/api', assetRoutes)
app.use('/api', projectMemberRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/ai-providers', aiProviderRoutes)
app.use('/api/model-preferences', modelPreferenceRoutes)
app.use('/api', documentRoutes)
app.use('/api', scriptRoutes)
app.use('/api', novelRoutes)
app.use('/api', directorRoutes)
app.use('/api', storylineRoutes)
app.use('/api', outlineRoutes)
app.use('/api', shotRoutes)
app.use('/api', shotGenerationRoutes)
app.use('/api', panelRoutes)
app.use('/api', panelGenerationRoutes)
app.use('/api', videoGenerationRoutes)
app.use('/api', nineGridRoutes)
app.use('/api/export', exportRoutes)
app.use('/api/audit', auditRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/agent-stream', agentStreamRoutes)
app.use('/api/agent', agentRoutes)
app.use('/api/prompt-templates', promptTemplateRoutes)
app.use('/api/prompt', promptRoutes)
app.use('/api/project-settings', projectSettingsRoutes)
app.use('/api/chat-history', chatHistoryRoutes)
app.use('/api', itemRoutes)
app.use('/api/assistant', assistantRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/image-generation', imageGenerationRoutes)
app.use('/api/image-enhancement', imageEnhancementRoutes)
app.use('/api/content', contentProcessRoutes)
app.use('/api', episodeRoutes)
app.use('/api', sceneRoutes)
app.use('/api', shotAlternativeRoutes)
app.use('/api', shotDraftRoutes)
app.use('/api', mentionRoutes)
app.use('/api', ttsRoutes)
app.use('/api', subtitleRoutes)
app.use('/api', timelineRoutes)
app.use('/api', productionRoutes)
app.use('/temp', express.static(path.join(process.cwd(), 'temp')))

app.use(sentryErrorHandler)
app.use(notFoundHandler)
app.use(errorMiddleware)

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server is running on port ${PORT}`)
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
