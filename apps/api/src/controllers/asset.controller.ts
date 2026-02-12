import { Request, Response } from 'express'
import { prisma } from '../lib/prisma'

export class AssetController {
  async listCharacters(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params

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

      const characters = await prisma.character.findMany({
        where: { projectId },
        include: {
          wardrobes: true,
          _count: {
            select: { shots: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json(characters)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async createCharacter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params
      const { name, age, gender, appearance, referenceImages } = req.body

      if (!name || !appearance) {
        res.status(400).json({ error: 'Name and appearance are required' })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: req.userId,
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const character = await prisma.character.create({
        data: {
          projectId,
          name,
          age,
          gender,
          appearance,
          referenceImages: referenceImages || [],
        },
      })

      res.status(201).json(character)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async updateCharacter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { name, age, gender, appearance, referenceImages } = req.body

      const character = await prisma.character.findFirst({
        where: {
          id,
          project: {
            ownerId: req.userId,
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
          referenceImages,
        },
      })

      res.json(updated)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async deleteCharacter(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const character = await prisma.character.findFirst({
        where: {
          id,
          project: {
            ownerId: req.userId,
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
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params

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

      const scenes = await prisma.scene.findMany({
        where: { projectId },
        include: {
          _count: {
            select: { shots: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json(scenes)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async createScene(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { projectId } = req.params
      const { location, time, atmosphere, referenceImages } = req.body

      if (!location || !time) {
        res.status(400).json({ error: 'Location and time are required' })
        return
      }

      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: req.userId,
        },
      })

      if (!project) {
        res.status(404).json({ error: 'Project not found' })
        return
      }

      const scene = await prisma.scene.create({
        data: {
          projectId,
          location,
          time,
          atmosphere,
          referenceImages: referenceImages || [],
        },
      })

      res.status(201).json(scene)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async updateScene(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params
      const { location, time, atmosphere, referenceImages } = req.body

      const scene = await prisma.scene.findFirst({
        where: {
          id,
          project: {
            ownerId: req.userId,
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
          referenceImages,
        },
      })

      res.json(updated)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async deleteScene(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const scene = await prisma.scene.findFirst({
        where: {
          id,
          project: {
            ownerId: req.userId,
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

      res.json({ message: 'Scene deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async createWardrobe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { characterId } = req.params
      const { name, description, referenceImage } = req.body

      if (!name) {
        res.status(400).json({ error: 'Name is required' })
        return
      }

      const character = await prisma.character.findFirst({
        where: {
          id: characterId,
          project: {
            ownerId: req.userId,
          },
        },
      })

      if (!character) {
        res.status(404).json({ error: 'Character not found' })
        return
      }

      const wardrobe = await prisma.wardrobe.create({
        data: {
          characterId,
          name,
          description,
          referenceImage,
        },
      })

      res.status(201).json(wardrobe)
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async deleteWardrobe(req: Request, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }

      const { id } = req.params

      const wardrobe = await prisma.wardrobe.findFirst({
        where: {
          id,
          character: {
            project: {
              ownerId: req.userId,
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
