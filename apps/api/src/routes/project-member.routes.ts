import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { checkProjectAccess, checkProjectRole } from '../middleware/permission.middleware'
import { projectMemberController } from '../controllers/project-member.controller'

const router = Router()

router.get('/projects/:projectId/members', authMiddleware, checkProjectAccess, projectMemberController.getProjectMembers.bind(projectMemberController))

router.post('/projects/:projectId/members', authMiddleware, checkProjectAccess, checkProjectRole('owner'), projectMemberController.addMember.bind(projectMemberController))

router.delete('/projects/:projectId/members/:userId', authMiddleware, checkProjectAccess, projectMemberController.removeMember.bind(projectMemberController))

router.patch('/projects/:projectId/members/:userId/role', authMiddleware, checkProjectAccess, checkProjectRole('owner'), projectMemberController.updateMemberRole.bind(projectMemberController))

router.get('/users/search', authMiddleware, projectMemberController.searchUsers.bind(projectMemberController))

export default router
