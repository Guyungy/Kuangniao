import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// 所有路由都需要认证
router.use(authenticateToken);

// 获取当前用户信息
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    
    res.json({
      code: '00000',
      msg: '获取用户信息成功',
      data: {
        userId: user.id,
        username: user.username,
        nickname: user.display_name,
        avatar: '', // 暂时为空，后续可以添加头像功能
        roles: [user.role], // 将角色转换为数组格式
        perms: [] // 暂时为空，后续可以根据角色添加权限
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: '50000',
      msg: '服务器内部错误',
      data: null
    });
  }
});

export default router;