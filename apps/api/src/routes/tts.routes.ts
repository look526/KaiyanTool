import { Router } from 'express'
import { ttsController } from '../controllers/tts.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()
router.use(authMiddleware)

router.post('/projects/:project_id/tts/synthesize', ttsController.synthesize.bind(ttsController))
router.post('/projects/:project_id/tts/batch', ttsController.batchSynthesize.bind(ttsController))
router.get('/tts/voices', ttsController.listVoices.bind(ttsController))
router.get('/projects/:project_id/voice-profiles', ttsController.getVoiceProfiles.bind(ttsController))
router.post('/projects/:project_id/voice-profiles', ttsController.upsertVoiceProfile.bind(ttsController))
router.delete('/voice-profiles/:id', ttsController.deleteVoiceProfile.bind(ttsController))

export default router
