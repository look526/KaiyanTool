import { prisma } from '../lib/prisma';
import { z } from 'zod';

const InviteSchema = z.object({
  projectId: z.string(),
  email: z.string().email(),
  role: z.enum(['viewer', 'editor', 'admin', 'owner'])
});

const UpdateMemberSchema = z.object({
  memberId: z.string(),
  role: z.enum(['viewer', 'editor', 'admin', 'owner'])
});

export class CollaborationService {
  async inviteMember(inviterId: string, input: z.infer<typeof InviteSchema>) {
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

    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId: validated.projectId,
        email: validated.email,
        role: validated.role,
        invitedBy: inviterId,
        token: this.generateToken()
      }
    });

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    if (invitation.status === 'accepted') {
      throw new Error('Invitation already accepted');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email !== invitation.email) {
      throw new Error('Email does not match');
    }

    await prisma.$transaction([
      prisma.projectInvitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' }
      }),
      prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId: userId,
          role: invitation.role
        }
      })
    ]);

    return { success: true };
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

  async getPendingInvitations(projectId: string) {
    const invitations = await prisma.projectInvitation.findMany({
      where: {
        projectId,
        status: 'pending'
      },
      include: {
        invitedByUser: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return invitations;
  }

  async updateMemberRole(memberId: string, newRole: z.infer<typeof UpdateMemberSchema>['role']) {
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot change owner role');
    }

    const updated = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: newRole }
    });

    return updated;
  }

  async removeMember(memberId: string) {
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      throw new Error('Member not found');
    }

    if (member.role === 'owner') {
      throw new Error('Cannot remove owner');
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
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

    await prisma.projectMember.delete({
      where: { id: member.id }
    });

    return { success: true };
  }

  async cancelInvitation(invitationId: string) {
    await prisma.projectInvitation.delete({
      where: { id: invitationId }
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
      prisma.projectMember.update({
        where: { id: newOwner.id },
        data: { role: 'owner' }
      }),
      prisma.projectMember.update({
        where: { id: (await prisma.projectMember.findFirst({ where: { projectId, userId: fromUserId } }))?.id },
        data: { role: 'admin' }
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
      owned: owned.map(p => ({
        ...p,
        role: 'owner',
        memberCount: p._count.members
      })),
      shared: shared.map(m => ({
        ...m.project,
        role: m.role,
        memberCount: m.project._count.members
      }))
    };
  }

  async addComment(projectId: string, userId: string, content: string, context?: {
    shotId?: string;
    assetId?: string;
    panelId?: string;
  }) {
    const comment = await prisma.comment.create({
      data: {
        projectId,
        userId,
        content,
        shotId: context?.shotId,
        assetId: context?.assetId,
        panelId: context?.panelId
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    return comment;
  }

  async getComments(projectId: string, options?: { shotId?: string; assetId?: string }) {
    const comments = await prisma.comment.findMany({
      where: {
        projectId,
        shotId: options?.shotId,
        assetId: options?.assetId
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return comments;
  }

  async resolveComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: {
        resolved: true,
        resolvedBy: userId,
        resolvedAt: new Date()
      }
    });

    return { success: true };
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export const collaborationService = new CollaborationService();
