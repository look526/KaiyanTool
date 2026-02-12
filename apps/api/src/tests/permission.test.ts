import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../jest.setup';
import { checkProjectAccess, checkProjectRole } from '../src/middleware/permission.middleware';

describe('Permission Middleware', () => {
  let testUser: any;
  let testProject: any;
  let authToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        email: 'permission-test@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Permission Test User',
      },
    });

    authToken = jwt.sign(
      { userId: testUser.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
  });

  beforeEach(async () => {
    await prisma.project.deleteMany();
    await prisma.projectMember.deleteMany();

    testProject = await prisma.project.create({
      data: {
        name: 'Test Project',
        ownerId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  describe('checkProjectAccess', () => {
    it('should allow access for project owner', async () => {
      const req = {
        userId: testUser.id,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await checkProjectAccess(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow access for project member', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'member@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Member User',
        },
      });

      await prisma.projectMember.create({
        data: {
          projectId: testProject.id,
          userId: otherUser.id,
          role: 'editor',
        },
      });

      const req = {
        userId: otherUser.id,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await checkProjectAccess(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access for non-member', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'nonmember@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Non Member User',
        },
      });

      const req = {
        userId: otherUser.id,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await checkProjectAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent project', async () => {
      const req = {
        userId: testUser.id,
        params: { projectId: '00000000-0000-0000-0000-000000000000' },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await checkProjectAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access without userId', async () => {
      const req = {
        userId: undefined,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      await checkProjectAccess(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkProjectRole', () => {
    it('should allow owner with any role check', async () => {
      const req = {
        userId: testUser.id,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = checkProjectRole(['owner', 'editor', 'viewer']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow editor for editor role', async () => {
      const editorUser = await prisma.user.create({
        data: {
          email: 'editor2@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Editor User 2',
        },
      });

      await prisma.projectMember.create({
        data: {
          projectId: testProject.id,
          userId: editorUser.id,
          role: 'editor',
        },
      });

      const req = {
        userId: editorUser.id,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = checkProjectRole(['owner', 'editor']);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny viewer for editor role', async () => {
      const viewerUser = await prisma.user.create({
        data: {
          email: 'viewer2@example.com',
          passwordHash: await bcrypt.hash('password123', 10),
          name: 'Viewer User 2',
        },
      });

      await prisma.projectMember.create({
        data: {
          projectId: testProject.id,
          userId: viewerUser.id,
          role: 'viewer',
        },
      });

      const req = {
        userId: viewerUser.id,
        params: { projectId: testProject.id },
      } as unknown as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      const next = jest.fn() as NextFunction;

      const middleware = checkProjectRole(['owner', 'editor']);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
