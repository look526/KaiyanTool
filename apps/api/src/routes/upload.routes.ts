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

router.get('/assets', async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { type, search } = req.query
    const { prisma } = await import('../lib/prisma')
    
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
      select: { id: true },
    })

    const projectIds = userProjects.map(p => p.id)

    const assets = await prisma.asset.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'desc' },
    })

    const assetsWithName = assets.map(asset => ({
      ...asset,
      name: (asset.metadata as any)?.name || '未命名素材',
      thumbnailUrl: (asset.metadata as any)?.thumbnailUrl || asset.url
    }))

    const characters = await prisma.character.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true, name: true, referenceImages: true, projectId: true },
    })

    const scenes = await prisma.scene.findMany({
      where: { projectId: { in: projectIds } },
      select: { id: true, location: true, referenceImages: true, projectId: true },
    })

    const characterImages = characters.flatMap(char => 
      (char.referenceImages || []).map((url, idx) => ({
        id: `char-${char.id}-${idx}`,
        type: 'character',
        url,
        thumbnailUrl: url,
        name: `${char.name} - 参考图 ${idx + 1}`,
        projectId: char.projectId,
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
        thumbnailUrl: url,
        name: `${scene.location} - 参考图 ${idx + 1}`,
        projectId: scene.projectId,
        metadata: { sceneId: scene.id, sceneLocation: scene.location },
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )

    let allAssets = [...assetsWithName, ...characterImages, ...sceneImages]

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

router.post('/assets', upload.single('file'), async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const { prisma } = await import('../lib/prisma')
    const { uploadToStorage } = await import('../lib/storage')
    
    const filename = `assets/${req.userId}/${Date.now()}-${file.originalname}`
    const url = await uploadToStorage(file.buffer, filename, file.mimetype)

    const asset = await prisma.asset.create({
      data: {
        type: file.mimetype.startsWith('image/') ? 'image' : 
              file.mimetype.startsWith('video/') ? 'video' : 
              file.mimetype.startsWith('audio/') ? 'audio' : 'document',
        url,
        projectId: req.body.projectId || '00000000-0000-0000-0000-000000000000',
        metadata: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          userId: req.userId,
        },
      },
    })

    res.json(asset)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

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

    const assetsWithName = assets.map(asset => ({
      ...asset,
      name: (asset.metadata as any)?.name || '未命名素材',
      thumbnailUrl: (asset.metadata as any)?.thumbnailUrl || asset.url
    }))

    const characters = await prisma.character.findMany({
      where: { projectId },
      select: { id: true, name: true, referenceImages: true },
    })

    const scenes = await prisma.scene.findMany({
      where: { projectId },
      select: { id: true, location: true, referenceImages: true },
    })

    const characterImages = characters.flatMap(char => 
      (char.referenceImages || []).map((url, idx) => ({
        id: `char-${char.id}-${idx}`,
        type: 'character',
        url,
        thumbnailUrl: url,
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
        thumbnailUrl: url,
        name: `${scene.location} - 参考图 ${idx + 1}`,
        projectId,
        metadata: { sceneId: scene.id, sceneLocation: scene.location },
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    )

    let allAssets = [...assetsWithName, ...characterImages, ...sceneImages]

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
