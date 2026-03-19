import { Request, Response } from 'express'
import * as crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { getOrCreateDefaultEpisode } from '../utils/episode-resolver'

export class AssetController {
  async listCharacters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params

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

      const characters = await prisma.character.findMany({
        where: { project_id: project_id },
        include: {
          Wardrobe: true,
          _count: {
            select: { Shot: true },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      res.json(characters)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async createCharacter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const { name, age, gender, appearance, reference_images } = req.body

      if (!name || !appearance) {
        res.status(400).json({ error: 'Name and appearance are required' })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const character = await prisma.character.create({
        data: {
          id: crypto.randomUUID(),
          project_id: project_id,
          name,
          age,
          gender,
          appearance,
          reference_images: reference_images || [],
          created_at: new Date(),
          updated_at: new Date(),
        },
      })

      res.status(201).json(character)
    } catch (error) {
      console.error('Create character error:', error)
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) })
    }
  }

  async updateCharacter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { name, age, gender, appearance, reference_images } = req.body

      const character = await prisma.character.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!character) {
        res.status(404).json({ error: 'Character not found or unauthorized' })
        return
      }

      const updated = await prisma.character.update({
        where: { id },
        data: {
          name,
          age,
          gender,
          appearance,
          reference_images,
        },
      })

      res.json(updated)
    } catch (error) {
      console.error('Update character error:', error)
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) })
    }
  }

  async deleteCharacter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const character = await prisma.character.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!character) {
        res.status(404).json({ error: 'Character not found or unauthorized' })
        return
      }

      await prisma.character.delete({
        where: { id },
      })

      res.json({ message: 'Character deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async listScenes(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params

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

      const scenes = await prisma.scene.findMany({
        where: { project_id: project_id },
        include: {
          _count: {
            select: { Shot: true },
          },
        },
        orderBy: { created_at: 'desc' },
      })

      res.json(scenes)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async createScene(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { project_id } = req.params
      const { location, time, atmosphere, description } = req.body

      if (!location || !time) {
        res.status(400).json({ error: 'Location and time are required' })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: project_id,
          owner_id: req.user_id,
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const episode = await getOrCreateDefaultEpisode(project_id)

      // 获取下一个 scene_order
      const maxScene = await prisma.scene.findFirst({
        where: { episode_id: episode.id },
        orderBy: { scene_order: 'desc' },
        select: { scene_order: true },
      })

      const nextSceneOrder = (maxScene?.scene_order || 0) + 1

      const scene = await prisma.scene.create({
        data: {
          id: crypto.randomUUID(),
          episode_id: episode.id,
          project_id: project_id,
          location,
          time,
          description: description || atmosphere,
          scene_order: nextSceneOrder,
          updated_at: new Date(),
        },
      })

      res.status(201).json(scene)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async updateScene(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { location, time, atmosphere, reference_images, description } = req.body

      const scene = await prisma.scene.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!scene) {
        res.status(404).json({ error: 'Scene not found or unauthorized' })
        return
      }

      const updated = await prisma.scene.update({
        where: { id },
        data: {
          location,
          time,
          atmosphere,
          reference_images,
        },
      })

      res.json(updated)
    } catch (error) {
      console.error('Update scene error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async deleteScene(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const scene = await prisma.scene.findFirst({
        where: {
          id,
          Project: {
            OR: [
              { owner_id: req.user_id },
              { ProjectMember: { some: { user_id: req.user_id } } },
            ],
          },
        },
      })

      if (!scene) {
        res.status(404).json({ error: 'Scene not found or unauthorized' })
        return
      }

      await prisma.scene.delete({
        where: { id },
      })

      res.json({ success: true, message: 'Scene deleted successfully' })
    } catch (error) {
      console.error('Delete scene error:', error)
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) })
    }
  }

  async createWardrobe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { character_id } = req.params
      const { name, description, reference_image } = req.body

      if (!name) {
        res.status(400).json({ error: 'Name is required' })
        return
      }

      const character = await prisma.character.findFirst({
        where: {
          id: character_id,
          Project: {
            owner_id: req.user_id,
          },
        },
      })

      if (!character) {
        res.status(404).json({ error: 'Character not found' })
        return
      }

      const wardrobe = await prisma.wardrobe.create({
        data: {
          id: crypto.randomUUID(),
          character_id: character_id,
          name,
          description,
          reference_image,
        },
      })

      res.status(201).json(wardrobe)
    } catch (error) {
      console.error('Create wardrobe error:', error)
      res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) })
    }
  }

  async deleteWardrobe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user_id) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const wardrobe = await prisma.wardrobe.findFirst({
        where: {
          id,
          Character: {
            Project: {
              owner_id: req.user_id,
            },
          },
        },
      })

      if (!wardrobe) {
        res.status(404).json({ error: 'Wardrobe not found or unauthorized' })
        return
      }

      await prisma.wardrobe.delete({
        where: { id },
      })

      res.json({ message: 'Wardrobe deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export const assetController = new AssetController()
