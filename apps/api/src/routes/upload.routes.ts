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

router.get('/projects/:projectId/assets', async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { projectId } = req.params
    const { type, search } = req.query

    const { prisma } = await import('../lib/prisma')
    
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const assets = await prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    })

    const characters = await prisma.character.findMany({
      where: { projectId },
      select: { id: true, name: true, referenceImages: true },
    })

    const scenes = await prisma.scene.findMany({
      where: { projectId },
      select: { id: true, title: true, referenceImages: true },
    })

    const characterImages = characters.flatMap(char => 
      (char.referenceImages || []).map((url, idx) => ({
        id: `char-${char.id}-${idx}`,
        type: 'character',
        url,
        name: `${char.name} - 参考图 ${idx + 1}`,
        projectId,
        metadata: { characterId: char.id, characterName: char.name },
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )

    const sceneImages = scenes.flatMap(scene => 
      (scene.referenceImages || []).map((url, idx) => ({
        id: `scene-${scene.id}-${idx}`,
        type: 'scene',
        url,
        name: `${scene.title} - 参考图 ${idx + 1}`,
        projectId,
        metadata: { sceneId: scene.id, sceneTitle: scene.title },
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )

    let allAssets = [...assets, ...characterImages, ...sceneImages]

    if (type && type !== 'all') {
      if (type === 'image') {
        allAssets = allAssets.filter(a => 
          a.type === 'image' || a.type === 'character' || a.type === 'scene'
        )
      } else {
        allAssets = allAssets.filter(a => a.type === type)
      }
    }

    if (search) {
      const searchLower = (search as string).toLowerCase()
      allAssets = allAssets.filter(a => 
        a.name.toLowerCase().includes(searchLower)
      )
    }

    allAssets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    res.json(allAssets)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/projects/:projectId/assets', upload.single('file'), uploadController.uploadAsset.bind(uploadController))

router.delete('/assets/:id', async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { id } = req.params
    const { prisma } = await import('../lib/prisma')

    const asset = await prisma.asset.findUnique({
      where: { id },
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    if (asset.project.ownerId !== req.userId) {
      const member = await prisma.projectMember.findFirst({
        where: {
          projectId: asset.projectId,
          userId: req.userId,
        },
      })

      if (!member || member.role === 'viewer') {
        res.status(403).json({ error: 'Forbidden' })
        return
      }
    }

    await prisma.asset.delete({ where: { id } })

    res.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
