import { Router, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { Product, ProductStatus } from '../models/Product';

const router: Router = Router();

// 认证
router.use(authenticateToken);

// 列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('keyword').optional().isString()
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ code: 'B0001', message: '参数验证失败', data: null, errors: errors.array() });
      return;
    }
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    const keyword = (req.query.keyword as string) || '';
    const offset = (page - 1) * limit;

    const where: any = {};
    if (keyword) where.name = { $like: `%${keyword}%` } as any;

    const { rows, count } = await Product.findAndCountAll({ where, limit, offset, order: [['created_at', 'DESC']] });
    res.json({ code: '00000', msg: 'OK', data: { list: rows, total: count, page, limit } });
  } catch (error) {
    res.status(500).json({ code: '50000', msg: '服务器内部错误', data: null });
  }
});

// 详情
router.get('/:id', [ param('id').isInt({ min: 1 }) ], async (req: Request, res: Response): Promise<void> => {
  const item = await Product.findByPk(parseInt(req.params.id));
  if (!item) { res.status(404).json({ code: 'B0001', msg: '商品不存在', data: null }); return; }
  res.json({ code: '00000', msg: 'OK', data: item });
});

// 创建
router.post('/', [
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('price').isFloat({ min: 0 }),
  body('commission_rate').isFloat({ min: 0, max: 1 }),
  body('status').optional().isIn(Object.values(ProductStatus))
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ code: 'B0001', message: '参数验证失败', data: null, errors: errors.array() }); return; }
    const created = await Product.create(req.body);
    res.json({ code: '00000', msg: '创建成功', data: { id: created.id } });
  } catch (error) {
    res.status(500).json({ code: '50000', msg: '服务器内部错误', data: null });
  }
});

// 更新
router.put('/:id', [
  param('id').isInt({ min: 1 }),
  body('name').optional().isString().isLength({ min: 1, max: 100 }),
  body('price').optional().isFloat({ min: 0 }),
  body('commission_rate').optional().isFloat({ min: 0, max: 1 }),
  body('status').optional().isIn(Object.values(ProductStatus))
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { res.status(400).json({ code: 'B0001', message: '参数验证失败', data: null, errors: errors.array() }); return; }
    const item = await Product.findByPk(parseInt(req.params.id));
    if (!item) { res.status(404).json({ code: 'B0001', msg: '商品不存在', data: null }); return; }
    await item.update(req.body);
    res.json({ code: '00000', msg: '更新成功', data: null });
  } catch (error) {
    res.status(500).json({ code: '50000', msg: '服务器内部错误', data: null });
  }
});

// 删除（软禁用）
router.delete('/:id', [ param('id').isInt({ min: 1 }) ], async (req: Request, res: Response): Promise<void> => {
  const item = await Product.findByPk(parseInt(req.params.id));
  if (!item) { res.status(404).json({ code: 'B0001', msg: '商品不存在', data: null }); return; }
  await item.update({ status: ProductStatus.INACTIVE });
  res.json({ code: '00000', msg: '已禁用', data: null });
});

export default router;


