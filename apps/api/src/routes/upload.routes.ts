import { Router } from 'express'
import { uploadController } from '../controllers/upload.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import multer from 'multer'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { ASSET_CATEGORIES, ASSET_SOURCES, ASSET_CATEGORY_LABELS, ASSET_SOURCE_LABELS } from '../constants/asset-categories'

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/avi', 'video/mov',
      'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
      'application/pdf'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  },
})

function fixFilename(filename: string): string {
  try {
    return Buffer.from(filename, 'latin1').toString('utf8')
  } catch {
    return filename
  }
}

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

router.get('/assets/debug', async (req, res) => {
  try {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    console.log('[DEBUG ASSETS] User ID:', req.user_id)

    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { owner_id: req.user_id },
          { ProjectMember: { some: { user_id: req.user_id } } },
        ],
      },
      select: { id: true },
    })

    console.log('[DEBUG ASSETS] User projects:', userProjects)

    const projectIds = userProjects.map(p => p.id)
    projectIds.push('00000000-0000-0000-0000-000000000000')

    console.log('[DEBUG ASSETS] Project IDs:', projectIds)

    const assets = await prisma.asset.findMany({
      where: { project_id: { in: projectIds } },
      orderBy: { created_at: 'desc' },
    })

    console.log('[DEBUG ASSETS] Raw assets from DB:', assets.length, assets.map(a => ({ id: a.id, project_id: a.project_id, url: a.url })))

    res.json({
      user_id: req.user_id,
      user_projects: userProjects,
      project_ids: projectIds,
      assets_count: assets.length,
      assets: assets.map(a => ({
        id: a.id,
        project_id: a.project_id,
        url: a.url,
        type: a.type,
        created_at: a.created_at,
        metadata: a.metadata
      }))
    })
  } catch (error) {
    console.error('Error in debug assets:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/assets', async (req, res) => {
  try {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { type, search, category, source } = req.query
    
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { owner_id: req.user_id },
          { ProjectMember: { some: { user_id: req.user_id } } },
        ],
      },
      select: { id: true },
    })

    const projectIds = userProjects.map(p => p.id)
    projectIds.push('00000000-0000-0000-0000-000000000000')

    console.log('[GET ASSETS] Query params:', { type, search, category, source })
    console.log('[GET ASSETS] User projects:', userProjects.length)
    console.log('[GET ASSETS] Project IDs including global:', projectIds)

    const assets = await prisma.asset.findMany({
      where: { project_id: { in: projectIds } },
      orderBy: { created_at: 'desc' },
    })

    console.log('[GET ASSETS] Found assets count:', assets.length)

    const assetsWithName = assets.map(asset => ({
      ...asset,
      name: (asset.metadata as any)?.name || '未命名素材',
      thumbnailUrl: (asset.metadata as any)?.thumbnailUrl || asset.url,
      categoryLabel: ASSET_CATEGORY_LABELS[asset.category as keyof typeof ASSET_CATEGORY_LABELS] || ASSET_CATEGORY_LABELS.general,
      sourceLabel: ASSET_SOURCE_LABELS[asset.source as keyof typeof ASSET_SOURCE_LABELS] || ASSET_SOURCE_LABELS.upload,
    }))

    const characters = await prisma.character.findMany({
      where: { project_id: { in: projectIds } },
      select: { id: true, reference_images: true, project_id: true },
    })

    const scenes = await prisma.scene.findMany({
      where: { project_id: { in: projectIds } },
      select: { id: true, location: true, reference_images: true, project_id: true },
    })

    const characterImages = characters.flatMap(char => 
      (char.reference_images || []).map((url, idx) => ({
        id: `char-${char.id}-${idx}`,
        type: 'character',
        url,
        thumbnailUrl: url,
        name: `角色参考图 ${idx + 1}`,
        project_id: char.project_id,
        category: ASSET_CATEGORIES.CHARACTER,
        source: ASSET_SOURCES.CHARACTER_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.character,
        sourceLabel: ASSET_SOURCE_LABELS.character_generation,
        metadata: { characterId: char.id },
        created_at: new Date(),
        updated_at: new Date(),
      }))
    )

    const sceneImages = scenes.flatMap(scene => 
      (scene.reference_images || []).map((url, idx) => ({
        id: `scene-${scene.id}-${idx}`,
        type: 'scene',
        url,
        thumbnailUrl: url,
        name: `${scene.location} - 参考图 ${idx + 1}`,
        project_id: scene.project_id,
        category: ASSET_CATEGORIES.SCENE,
        source: ASSET_SOURCES.SCENE_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.scene,
        sourceLabel: ASSET_SOURCE_LABELS.scene_generation,
        metadata: { sceneId: scene.id, sceneLocation: scene.location },
        created_at: new Date(),
        updated_at: new Date(),
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

    allAssets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    res.json(allAssets)
  } catch (error) {
    console.error('Error fetching assets:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/assets', upload.single('file'), async (req, res) => {
  try {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }

    const { uploadToStorage } = await import('../lib/storage')
    
    const originalName = fixFilename(file.originalname)
    const safeName = originalName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    const filename = `assets/${req.user_id}/${Date.now()}-${safeName}`
    const url = await uploadToStorage(file.buffer, filename, file.mimetype)

    const category = req.body.category || ASSET_CATEGORIES.GENERAL
    const source = req.body.source || ASSET_SOURCES.UPLOAD

    console.log('[UPLOAD ASSET] Creating asset:', {
      userId: req.user_id,
      category,
      source,
      projectId: req.body.project_id || '00000000-0000-0000-0000-000000000000',
      originalName
    })

    const asset = await prisma.asset.create({
      data: {
        id: crypto.randomUUID(),
        type: file.mimetype.startsWith('image/') ? 'image' :
              file.mimetype.startsWith('video/') ? 'video' :
              file.mimetype.startsWith('audio/') ? 'audio' : 'document',
        url,
        project_id: req.body.project_id || '00000000-0000-0000-0000-000000000000',
        category,
        source,
        metadata: {
          originalName: originalName,
          size: file.size,
          mimetype: file.mimetype,
          userId: req.user_id,
          name: originalName,
          thumbnailUrl: url,
        },
        created_at: new Date(),
        updated_at: new Date(),
      },
    })

    console.log('[UPLOAD ASSET] Asset created successfully:', {
      id: asset.id,
      type: asset.type,
      url: asset.url,
      project_id: asset.project_id,
      user_id_from_metadata: (asset.metadata as any)?.userId
    })

    const metadata = asset.metadata as any
    res.json({
      ...asset,
      name: metadata?.name || originalName,
      thumbnailUrl: metadata?.thumbnailUrl || url,
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
    if (!req.user_id) {
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
        id: asset.project_id,
        OR: [
          { owner_id: req.user_id },
          { ProjectMember: { some: { user_id: req.user_id } } },
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

router.get('/projects/:project_id/assets', async (req, res) => {
  try {
    if (!req.user_id) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const { project_id } = req.params
    const { type, search, category, source } = req.query
    
    const project = await prisma.project.findFirst({
      where: {
        id: project_id,
        OR: [
          { owner_id: req.user_id },
          { ProjectMember: { some: { user_id: req.user_id } } },
        ],
      },
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const assets = await prisma.asset.findMany({
      where: { project_id: project_id },
      orderBy: { created_at: 'desc' },
    })

    const assetsWithName = assets.map(asset => ({
      ...asset,
      name: (asset.metadata as any)?.name || '未命名素材',
      thumbnailUrl: (asset.metadata as any)?.thumbnailUrl || asset.url,
      categoryLabel: ASSET_CATEGORY_LABELS[asset.category as keyof typeof ASSET_CATEGORY_LABELS] || ASSET_CATEGORY_LABELS.general,
      sourceLabel: ASSET_SOURCE_LABELS[asset.source as keyof typeof ASSET_SOURCE_LABELS] || ASSET_SOURCE_LABELS.upload,
    }))

    const characters = await prisma.character.findMany({
      where: { project_id: project_id },
      select: { id: true, name: true, reference_images: true },
    })

    const scenes = await prisma.scene.findMany({
      where: { project_id: project_id },
      select: { id: true, location: true, reference_images: true },
    })

    const characterImages = characters.flatMap(char => 
      (char.reference_images || []).map((url, idx) => ({
        id: `char-${char.id}-${idx}`,
        type: 'character',
        url,
        thumbnailUrl: url,
        name: `${char.name} - 参考图 ${idx + 1}`,
        project_id: project_id,
        category: ASSET_CATEGORIES.CHARACTER,
        source: ASSET_SOURCES.CHARACTER_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.character,
        sourceLabel: ASSET_SOURCE_LABELS.character_generation,
        metadata: { characterId: char.id, characterName: char.name },
        created_at: new Date(),
        updated_at: new Date(),
      }))
    )

    const sceneImages = scenes.flatMap(scene => 
      (scene.reference_images || []).map((url, idx) => ({
        id: `scene-${scene.id}-${idx}`,
        type: 'scene',
        url,
        thumbnailUrl: url,
        name: `${scene.location} - 参考图 ${idx + 1}`,
        project_id: project_id,
        category: ASSET_CATEGORIES.SCENE,
        source: ASSET_SOURCES.SCENE_GENERATION,
        categoryLabel: ASSET_CATEGORY_LABELS.scene,
        sourceLabel: ASSET_SOURCE_LABELS.scene_generation,
        metadata: { sceneId: scene.id, sceneLocation: scene.location },
        created_at: new Date(),
        updated_at: new Date(),
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

    allAssets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    res.json(allAssets)
  } catch (error) {
    console.error('Error fetching project assets:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/projects/:project_id/assets', upload.single('file'), uploadController.uploadAsset.bind(uploadController))

const GLOBAL_PROJECT_ID = '00000000-0000-0000-0000-000000000000'

/** 全局素材：POST /upload 写入 metadata.userId，且文件路径为 uploads/assets/{userId}/... */
function isGlobalAssetUploader(asset: { metadata: unknown; url: string }, userId: string): boolean {
  const meta =
    asset.metadata && typeof asset.metadata === 'object'
      ? (asset.metadata as Record<string, unknown>)
      : {}
  const fromMeta = meta.userId ?? meta.user_id
  if (typeof fromMeta === 'string' && fromMeta === userId) {
    return true
  }
  // 本地存储 URL：/uploads/assets/{userId}/...
  if (asset.url && asset.url.includes(`assets/${userId}/`)) {
    return true
  }
  return false
}

router.delete('/assets/:id', async (req, res) => {
  try {
    if (!req.user_id) {
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

    console.log('[DELETE ASSET] Found asset:', { id: asset.id, projectId: asset.project_id, url: asset.url });

    const isGlobalAsset = asset.project_id === GLOBAL_PROJECT_ID

    if (isGlobalAsset) {
      if (!isGlobalAssetUploader(asset, req.user_id)) {
        console.log('[DELETE ASSET] Forbidden: global asset but not owner (check metadata.userId or URL path)');
        res.status(403).json({ error: 'Forbidden' })
        return
      }
    } else {
      const project = await prisma.project.findFirst({
        where: {
          id: asset.project_id,
          OR: [
            { owner_id: req.user_id },
            { ProjectMember: { some: { user_id: req.user_id } } },
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
