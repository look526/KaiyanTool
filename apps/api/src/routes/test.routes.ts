import { Router } from 'express';
import testController from '../controllers/test.controller';

const router = Router();

router.get('/legacy-error', testController.testLegacyError);
router.get('/legacy-success', testController.testLegacySuccess);
router.get('/new-error', testController.testNewError);
router.get('/new-success', testController.testNewSuccess);
router.get('/base-controller', testController.testBaseController);

export default router;