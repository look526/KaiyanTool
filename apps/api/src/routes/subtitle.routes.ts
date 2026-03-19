import { Router } from 'express'
import { subtitleController } from '../controllers/subtitle.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()
router.use(authMiddleware)

router.post('/projects/:project_id/episodes/:episode_id/subtitles/generate', subtitleController.generate.bind(subtitleController))
router.get('/projects/:project_id/episodes/:episode_id/subtitles', subtitleController.get.bind(subtitleController))
router.put('/subtitles/:id/entries', subtitleController.updateEntries.bind(subtitleController))
router.put('/subtitles/:id/style', subtitleController.updateStyle.bind(subtitleController))
router.get('/subtitles/:id/export', subtitleController.exportSubtitle.bind(subtitleController))

export default router
