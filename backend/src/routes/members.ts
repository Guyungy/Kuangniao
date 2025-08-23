import { Router, Request, Response } from 'express';
import { Member, MemberStatus, Recharge, Order } from '../models';
import { authenticateToken } from '../middleware/auth';
import { body, query, param, validationResult } from 'express-validator';
import { Op } from 'sequelize';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取会员列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('keyword').optional().isString().withMessage('搜索关键词必须是字符串'),
  query('status').optional().isIn(Object.values(MemberStatus)).withMessage('状态值无效')
], async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== 获取会员列表请求 ===');
    console.log('请求路径:', req.path);
    console.log('请求方法:', req.method);
    console.log('查询参数:', req.query);
    console.log('请求头:', req.headers);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('参数验证失败:', errors.array());
      res.status(400).json({
        code: 'B0001',
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const keyword = req.query.keyword as string;
    const status = req.query.status as MemberStatus;

    console.log('解析后的参数:', { page, limit, keyword, status });

    const offset = (page - 1) * limit;
    const where: any = {};

    // 搜索条件
    if (keyword && keyword.trim()) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword.trim()}%` } },
        { nickname: { [Op.like]: `%${keyword.trim()}%` } },
        { phone: { [Op.like]: `%${keyword.trim()}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    console.log('数据库查询条件:', where);

    const { rows: members, count: total } = await Member.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      attributes: {
        exclude: []
      }
    });

    console.log('查询结果:', { count: total, membersCount: members.length });

    res.json({
      code: "00000",
      message: '获取会员列表成功',
      data: {
        list: members,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取会员列表错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取会员详情
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('会员ID必须是正整数')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 'B0001',
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const memberId = parseInt(req.params.id);

    const member = await Member.findByPk(memberId, {
      include: [
        {
          model: Recharge,
          as: 'recharges',
          limit: 10,
          order: [['created_at', 'DESC']]
        },
        {
          model: Order,
          as: 'orders',
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!member) {
      res.status(404).json({
        code: 'B0001',
        message: '会员不存在',
        data: null
      });
      return;
    }

    res.json({
      code: '00000',
      message: '获取会员详情成功',
      data: member
    });
  } catch (error) {
    console.error('获取会员详情错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

// 创建会员
router.post('/', [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ max: 50 })
    .withMessage('用户名长度不能超过50个字符'),
  body('nickname')
    .notEmpty()
    .withMessage('昵称不能为空')
    .isLength({ max: 50 })
    .withMessage('昵称长度不能超过50个字符'),
  body('phone')
    .optional()
    .isMobilePhone('zh-CN')
    .withMessage('手机号格式不正确'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('余额必须是非负数'),
  body('status')
    .optional()
    .isIn(Object.values(MemberStatus))
    .withMessage('状态值无效')
], async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== 创建会员请求开始 ===');
    console.log('请求头 Content-Type:', req.headers['content-type']);
    console.log('原始请求体:', JSON.stringify(req.body, null, 2));
    console.log('请求体类型:', typeof req.body);
    console.log('请求体是否为空对象:', Object.keys(req.body).length === 0);
    console.log('请求参数:', req.params);
    console.log('请求查询参数:', req.query);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 'B0001',
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const { username, nickname, phone, balance = 0, status = MemberStatus.ACTIVE } = req.body;
    
    console.log('解构后的字段:');
    console.log('- username:', username, typeof username);
    console.log('- nickname:', nickname, typeof nickname);
    console.log('- phone:', phone, typeof phone);
    console.log('- balance:', balance, typeof balance);
    console.log('- status:', status, typeof status);

    // 检查用户名是否已存在
    const existingUsername = await Member.findOne({ where: { username } });
    if (existingUsername) {
      res.status(400).json({
        code: 'B0001',
        message: '用户名已存在',
        data: null
      });
      return;
    }

    // 检查昵称是否已存在
    const existingMember = await Member.findOne({ where: { nickname } });
    if (existingMember) {
      res.status(400).json({
        code: 'B0001',
        message: '昵称已存在',
        data: null
      });
      return;
    }

    // 检查手机号是否已存在
    if (phone) {
      const existingPhone = await Member.findOne({ where: { phone } });
      if (existingPhone) {
        res.status(400).json({
          code: 'B0001',
          message: '手机号已存在',
          data: null
        });
        return;
      }
    }

    const member = await Member.create({
      username,
      nickname,
      phone,
      balance,
      status
    });

    res.status(201).json({
      code: '00000',
      message: '创建会员成功',
      data: member
    });
  } catch (error) {
    console.error('创建会员错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

// 更新会员
router.put('/:id', [
  param('id').isInt({ min: 1 }).withMessage('会员ID必须是正整数'),
  body('username')
    .optional()
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ max: 50 })
    .withMessage('用户名长度不能超过50个字符'),
  body('nickname')
    .optional()
    .notEmpty()
    .withMessage('昵称不能为空')
    .isLength({ max: 50 })
    .withMessage('昵称长度不能超过50个字符'),
  body('phone')
    .optional()
    .isMobilePhone('zh-CN')
    .withMessage('手机号格式不正确'),
  body('status')
    .optional()
    .isIn(Object.values(MemberStatus))
    .withMessage('状态值无效')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 'B0001',
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const memberId = parseInt(req.params.id);
    const { username, nickname, phone, status } = req.body;

    const member = await Member.findByPk(memberId);
    if (!member) {
      res.status(404).json({
        code: 'B0001',
        message: '会员不存在',
        data: null
      });
      return;
    }

    // 检查用户名是否已被其他会员使用
    if (username && username !== member.username) {
      const existingUsername = await Member.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: memberId }
        } 
      });
      if (existingUsername) {
        res.status(400).json({
          code: 'B0001',
          message: '用户名已存在',
          data: null
        });
        return;
      }
    }

    // 检查昵称是否已被其他会员使用
    if (nickname && nickname !== member.nickname) {
      const existingMember = await Member.findOne({ 
        where: { 
          nickname,
          id: { [Op.ne]: memberId }
        } 
      });
      if (existingMember) {
        res.status(400).json({
          code: 'B0001',
          message: '昵称已存在',
          data: null
        });
        return;
      }
    }

    // 检查手机号是否已被其他会员使用
    if (phone && phone !== member.phone) {
      const existingPhone = await Member.findOne({ 
        where: { 
          phone,
          id: { [Op.ne]: memberId }
        } 
      });
      if (existingPhone) {
        res.status(400).json({
          code: 'B0001',
          message: '手机号已存在',
          data: null
        });
        return;
      }
    }

    // 更新会员信息
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;

    await member.update(updateData);

    res.json({
      code: '00000',
      message: '更新会员成功',
      data: member
    });
  } catch (error) {
    console.error('更新会员错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

// 删除会员
router.delete('/:id', [
  param('id').isInt({ min: 1 }).withMessage('会员ID必须是正整数')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 'B0001',
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const memberId = parseInt(req.params.id);

    const member = await Member.findByPk(memberId);
    if (!member) {
      res.status(404).json({
        code: 'B0001',
        message: '会员不存在',
        data: null
      });
      return;
    }

    // 检查是否有关联的充值记录或订单
    const rechargeCount = await Recharge.count({ where: { member_id: memberId } });
    const orderCount = await Order.count({ where: { member_id: memberId } });

    if (rechargeCount > 0 || orderCount > 0) {
      res.status(400).json({
        code: 'B0001',
        message: '该会员存在充值记录或订单，无法删除',
        data: null
      });
      return;
    }

    await member.destroy();

    res.json({
      code: '00000',
      message: '删除会员成功',
      data: null
    });
  } catch (error) {
    console.error('删除会员错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取会员的充值记录
router.get('/:id/recharges', [
  param('id').isInt({ min: 1 }).withMessage('会员ID必须是正整数'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 400,
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const memberId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // 检查会员是否存在
    const member = await Member.findByPk(memberId);
    if (!member) {
      res.status(404).json({
        code: 'B0001',
        message: '会员不存在',
        data: null
      });
      return;
    }

    const { rows: recharges, count: total } = await Recharge.findAndCountAll({
      where: { member_id: memberId },
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: '00000',
      message: '获取充值记录成功',
      data: {
        list: recharges,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取充值记录错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

// 获取会员的订单记录
router.get('/:id/orders', [
  param('id').isInt({ min: 1 }).withMessage('会员ID必须是正整数'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        code: 400,
        message: '参数验证失败',
        data: null,
        errors: errors.array()
      });
      return;
    }

    const memberId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // 检查会员是否存在
    const member = await Member.findByPk(memberId);
    if (!member) {
      res.status(404).json({
        code: 404,
        message: '会员不存在',
        data: null
      });
      return;
    }

    const { rows: orders, count: total } = await Order.findAndCountAll({
      where: { member_id: memberId },
      include: [{
        model: Member,
        as: 'member',
        attributes: ['id', 'nickname']
      }],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      code: '00000',
      message: '获取订单记录成功',
      data: {
        list: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取订单记录错误:', error);
    res.status(500).json({
      code: 'B0001',
      message: '服务器内部错误',
      data: null
    });
  }
});

export default router;