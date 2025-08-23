import { Sequelize } from 'sequelize-typescript';
import { Member } from './Member';
import { Recharge } from './Recharge';
import { Worker } from './Worker';
import { Order } from './Order';
import { User } from './User';

// 导出所有模型
export {
  Member,
  Recharge,
  Worker,
  Order,
  User
};

// 导出枚举
export { MemberStatus } from './Member';
export { RechargeMethod } from './Recharge';
export { WorkerType, WorkerStatus } from './Worker';
export { PayMethod, OrderStatus } from './Order';
export { UserRole, UserStatus } from './User';

// 初始化模型关联关系
export const initializeModels = (sequelize: Sequelize): void => {
  // 添加模型到 Sequelize 实例
  sequelize.addModels([Member, Recharge, Worker, Order, User]);

  // 这里可以添加额外的关联关系配置
  // 注意：模型中已经通过装饰器定义了关联关系，这里主要用于复杂的关联配置
};

// 创建默认管理员用户的函数
export const createDefaultAdmin = async (): Promise<void> => {
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        display_name: '系统管理员',
        role: 'admin',
        status: 'active'
      });
      await admin.setPassword('admin123');
      await admin.save();
      console.log('默认管理员账户已创建: admin/admin123');
    }
  } catch (error) {
    console.error('创建默认管理员失败:', error);
  }
};

// 数据库同步函数
export const syncDatabase = async (sequelize: Sequelize, force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    console.log('数据库同步完成');
    
    // 创建默认管理员
    await createDefaultAdmin();
  } catch (error) {
    console.error('数据库同步失败:', error);
    throw error;
  }
};

// 模型列表（用于批量操作）
export const models = {
  Member,
  Recharge,
  Worker,
  Order,
  User
};

// 类型定义
export type ModelType = typeof Member | typeof Recharge | typeof Worker | typeof Order | typeof User;
export type ModelInstance = Member | Recharge | Worker | Order | User;