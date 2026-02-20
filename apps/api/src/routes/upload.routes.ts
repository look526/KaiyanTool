import { Router } from 'express'
import { uploadController } from '../controllers/upload.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  },
})

const router = Router()

router.use(authMiddleware)

router.post('/images', upload.single('file'), uploadController.uploadImage.bind(uploadController))
router.post('/images/character', upload.single('file'), uploadController.uploadCharacterImage.bind(uploadController))
router.post('/images/scene', upload.single('file'), uploadController.uploadSceneImage.bind(uploadController))
router.delete('/images/:filename', uploadController.deleteImage.bind(uploadController))

export default router
