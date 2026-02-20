import { prisma } from '../lib/prisma';
import { z } from 'zod';

const InviteSchema = z.object({
  projectId: z.string(),
  email: z.string().email(),
  role: z.enum(['viewer', 'editor', 'owner'])
});

const UpdateMemberSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  role: z.enum(['viewer', 'editor', 'owner'])
});

export class CollaborationService {
  async inviteMember(_inviterId: string, input: z.infer<typeof InviteSchema>) {
    const validated = InviteSchema.parse(input);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const project = await prisma.project.findUnique({
      where: { id: validated.projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: validated.projectId,
        userId: user.id
      }
    });

    if (existingMember) {
      throw new Error('User is already a member');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: validated.projectId,
        userId: user.id,
        role: validated.role
      }
    });

    return member;
  }

  async getProjectMembers(projectId: string) {
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true }
        }
      }
    });

    return members;
  }

  async updateMemberRole(projectId: string, userId: string, newRole: z.infer<typeof UpdateMemberSchema>['role']) {
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    const updated = await prisma.projectMember.updateMany({
      where: { projectId, userId },
      data: { role: newRole }
    });

    return { success: updated.count > 0 };
  }

  async removeMember(projectId: string, userId: string) {
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot remove owner');
    }

    await prisma.projectMember.deleteMany({
      where: { projectId, userId }
    });

    return { success: true };
  }

  async leaveProject(projectId: string, userId: string) {
    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId }
    });

    if (!member) {
      throw new Error('Not a member of this project');
    }

    if (member.role === 'owner') {
      throw new Error('Owner cannot leave. Transfer ownership first.');
    }

    await prisma.projectMember.deleteMany({
      where: { projectId, userId }
    });

    return { success: true };
  }

  async transferOwnership(projectId: string, fromUserId: string, toUserId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.ownerId !== fromUserId) {
      throw new Error('Only owner can transfer ownership');
    }

    const newOwner = await prisma.projectMember.findFirst({
      where: { projectId, userId: toUserId }
    });

    if (!newOwner) {
      throw new Error('Target user is not a member');
    }

    await prisma.$transaction([
      prisma.project.update({
        where: { id: projectId },
        data: { ownerId: toUserId }
      }),
      prisma.projectMember.updateMany({
        where: { projectId, userId: toUserId },
        data: { role: 'owner' as const }
      }),
      prisma.projectMember.updateMany({
        where: { projectId, userId: fromUserId },
        data: { role: 'editor' as const }
      })
    ]);

    return { success: true };
  }

  async getUserCollaborations(userId: string) {
    const [owned, shared] = await Promise.all([
      prisma.project.findMany({
        where: { ownerId: userId },
        include: {
          _count: { select: { members: true } }
        }
      }),
      prisma.projectMember.findMany({
        where: { userId },
        include: {
          project: {
            include: {
              owner: { select: { id: true, name: true, avatar: true } },
              _count: { select: { members: true } }
            }
          }
        }
      })
    ]);

    return {
      owned,
      shared: shared.map(m => m.project)
    };
  }
}

export const collaborationService = new CollaborationService();
