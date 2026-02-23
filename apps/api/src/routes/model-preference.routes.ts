import { Router } from 'express'
import { modelPreferenceController } from '../controllers/model-preference.controller'

const router = Router()

router.get('/', modelPreferenceController.getPreferences.bind(modelPreferenceController))
router.get('/history', modelPreferenceController.getHistory.bind(modelPreferenceController))
router.get('/stats', modelPreferenceController.getUsageStats.bind(modelPreferenceController))
router.get('/analytics', modelPreferenceController.getDetailedAnalytics.bind(modelPreferenceController))
router.post('/default', modelPreferenceController.setDefaultModels.bind(modelPreferenceController))
router.post('/usage', modelPreferenceController.recordUsage.bind(modelPreferenceController))
router.post('/test', modelPreferenceController.testModel.bind(modelPreferenceController))
router.get('/parameters/:contentType', modelPreferenceController.getParameters.bind(modelPreferenceController))
router.post('/parameters', modelPreferenceController.setParameters.bind(modelPreferenceController))

export default router
