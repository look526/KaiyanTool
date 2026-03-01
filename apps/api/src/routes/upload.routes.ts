import { Router } from 'express'
import { uploadController } from '../controllers/upload.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { ASSET_CATEGORIES, ASSET_SOURCES, ASSET_CATEGORY_LABELS, ASSET_SOURCE_LABELS } from '../constants/asset-categories'

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
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

router.get('/categories', (_req, res) => {
  res.json({
    categories: Object.entries(ASSET_CATEGORY_LABELS).map(([value, label]) => ({
      value,
      label
    })),
    sources: Object.entries(ASSET_SOURCE_LABELS).map(([value, label]) => ({
      value,
      label
    }))
  })
})

router.get('/assets', async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { type, search, category, source } = req.query
    
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
    projectIds.push('00000000-0000-0000-0000-000000000000')

    const assets = await prisma.asset.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { createdAt: 'desc' },
    })

    const assetsWithName = assets.map(asset => ({
      ...asset,
      name: (asset.metadata as any)?.name || '未命名素材',
      thumbnailUrl: (asset.metadata as any)?.thumbnailUrl || asset.url,
      categoryLabel: ASSET_CATEGORY_LABELS[asset.category as keyof typeof ASSET_CATEGORY_LABELS] || ASSET_CATEGORY_LABELS.general,
      sourceLabel: ASSET_SOURCE_LABELS[asset.source as keyof typeof ASSET_SOURCE_LABELS] || ASSET_SOURCE_LABELS.upload,
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
        category: ASSET_CATEGORIES.CHARACTER,
        source: ASSET_SOURCES.CHARACTER_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.character,
        sourceLabel: ASSET_SOURCE_LABELS.character_generation,
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
        category: ASSET_CATEGORIES.SCENE,
        source: ASSET_SOURCES.SCENE_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.scene,
        sourceLabel: ASSET_SOURCE_LABELS.scene_generation,
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

    if (category && category !== 'all') {
      allAssets = allAssets.filter(a => a.category === category)
    }

    if (source && source !== 'all') {
      allAssets = allAssets.filter(a => a.source === source)
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
    console.error('Error fetching assets:', error)
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

    const { uploadToStorage } = await import('../lib/storage')
    
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `assets/${req.userId}/${Date.now()}-${safeName}`
    const url = await uploadToStorage(file.buffer, filename, file.mimetype)

    const category = req.body.category || ASSET_CATEGORIES.GENERAL
    const source = req.body.source || ASSET_SOURCES.UPLOAD

    const asset = await prisma.asset.create({
      data: {
        type: file.mimetype.startsWith('image/') ? 'image' : 
              file.mimetype.startsWith('video/') ? 'video' : 
              file.mimetype.startsWith('audio/') ? 'audio' : 'document',
        url,
        projectId: req.body.projectId || '00000000-0000-0000-0000-000000000000',
        category,
        source,
        metadata: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          userId: req.userId,
          name: file.originalname,
          thumbnailUrl: url,
        },
      },
    })

    res.json({
      ...asset,
      categoryLabel: ASSET_CATEGORY_LABELS[category as keyof typeof ASSET_CATEGORY_LABELS] || ASSET_CATEGORY_LABELS.general,
      sourceLabel: ASSET_SOURCE_LABELS[source as keyof typeof ASSET_SOURCE_LABELS] || ASSET_SOURCE_LABELS.upload,
    })
  } catch (error) {
    console.error('Error creating asset:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.patch('/assets/:id/category', async (req, res) => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { id } = req.params
    const { category } = req.body

    if (!category || !Object.values(ASSET_CATEGORIES).includes(category)) {
      res.status(400).json({ error: 'Invalid category' })
      return
    }

    const asset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    const project = await prisma.project.findFirst({
      where: {
        id: asset.projectId,
        OR: [
          { ownerId: req.userId },
          { members: { some: { userId: req.userId } } },
        ],
      },
    })

    if (!project) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: { category }
    })

    res.json({
      ...updatedAsset,
      categoryLabel: ASSET_CATEGORY_LABELS[category as keyof typeof ASSET_CATEGORY_LABELS] || ASSET_CATEGORY_LABELS.general,
    })
  } catch (error) {
    console.error('Error updating asset category:', error)
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
    const { type, search, category, source } = req.query
    
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
      thumbnailUrl: (asset.metadata as any)?.thumbnailUrl || asset.url,
      categoryLabel: ASSET_CATEGORY_LABELS[asset.category as keyof typeof ASSET_CATEGORY_LABELS] || ASSET_CATEGORY_LABELS.general,
      sourceLabel: ASSET_SOURCE_LABELS[asset.source as keyof typeof ASSET_SOURCE_LABELS] || ASSET_SOURCE_LABELS.upload,
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
        category: ASSET_CATEGORIES.CHARACTER,
        source: ASSET_SOURCES.CHARACTER_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.character,
        sourceLabel: ASSET_SOURCE_LABELS.character_generation,
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
        category: ASSET_CATEGORIES.SCENE,
        source: ASSET_SOURCES.SCENE_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.scene,
        sourceLabel: ASSET_SOURCE_LABELS.scene_generation,
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

    if (category && category !== 'all') {
      allAssets = allAssets.filter(a => a.category === category)
    }

    if (source && source !== 'all') {
      allAssets = allAssets.filter(a => a.source === source)
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
    console.error('Error fetching project assets:', error)
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
    console.log('[DELETE ASSET] Attempting to delete asset:', id);

    const asset = await prisma.asset.findUnique({
      where: { id }
    })

    if (!asset) {
      console.log('[DELETE ASSET] Asset not found:', id);
      res.status(404).json({ error: 'Asset not found' })
      return
    }

    console.log('[DELETE ASSET] Found asset:', { id: asset.id, projectId: asset.projectId, url: asset.url });

    const isGlobalAsset = asset.projectId === '00000000-0000-0000-0000-000000000000'
    const isOwner = (asset.metadata as any)?.userId === req.userId

    if (isGlobalAsset) {
      if (!isOwner) {
        console.log('[DELETE ASSET] Forbidden: global asset but not owner');
        res.status(403).json({ error: 'Forbidden' })
        return
      }
    } else {
      const project = await prisma.project.findFirst({
        where: {
          id: asset.projectId,
          OR: [
            { ownerId: req.userId },
            { members: { some: { userId: req.userId } } },
          ],
        },
      })

      if (!project) {
        console.log('[DELETE ASSET] Forbidden: no project access');
        res.status(403).json({ error: 'Forbidden' })
        return
      }
    }

    await prisma.asset.delete({ where: { id } })
    console.log('[DELETE ASSET] Successfully deleted:', id);

    res.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    console.error('Error deleting asset:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
