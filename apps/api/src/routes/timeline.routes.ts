import { Router } from 'express'
import { timelineController } from '../controllers/timeline.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()
router.use(authMiddleware)

router.post('/projects/:project_id/episodes/:episode_id/timeline', timelineController.create.bind(timelineController))
router.get('/projects/:project_id/episodes/:episode_id/timeline', timelineController.get.bind(timelineController))
router.put('/timeline/:id/tracks', timelineController.updateTracks.bind(timelineController))
router.post('/timeline/:id/render', timelineController.startRender.bind(timelineController))
router.get('/timeline/:id/render/status', timelineController.getRenderStatus.bind(timelineController))

export default router
