import { Request, Response } from 'express';
import { BaseController } from './base.controller';

export class TestController extends BaseController {
  testLegacyError(_req: Request, res: Response): void {
    res.status(400).json({ error: '这是旧格式的错误' });
  }

  testLegacySuccess(_req: Request, res: Response): void {
    res.json({ user: { id: 1, name: 'test' } });
  }

  testNewError(_req: Request, res: Response): void {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: '这是新格式的错误' }
    });
  }

  testNewSuccess(_req: Request, res: Response): void {
    res.json({
      success: true,
      data: { user: { id: 1, name: 'test' } }
    });
  }

  testBaseController(_req: Request, res: Response): void {
    res.json(this.success({ message: '使用BaseController' }));
  }
}

export default new TestController();
