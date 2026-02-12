import { Router } from 'express'
import { assetController } from '../controllers/asset.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/projects/:projectId/characters', assetController.listCharacters.bind(assetController))
router.post('/projects/:projectId/characters', assetController.createCharacter.bind(assetController))
router.put('/characters/:id', assetController.updateCharacter.bind(assetController))
router.delete('/characters/:id', assetController.deleteCharacter.bind(assetController))

router.get('/projects/:projectId/scenes', assetController.listScenes.bind(assetController))
router.post('/projects/:projectId/scenes', assetController.createScene.bind(assetController))
router.put('/scenes/:id', assetController.updateScene.bind(assetController))
router.delete('/scenes/:id', assetController.deleteScene.bind(assetController))

router.post('/characters/:characterId/wardrobes', assetController.createWardrobe.bind(assetController))
router.delete('/wardrobes/:id', assetController.deleteWardrobe.bind(assetController))

export default router
