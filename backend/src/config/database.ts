import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

// 导入模型
import { Member } from '../models/Member';
import { Worker } from '../models/Worker';
import { Order } from '../models/Order';
import { Recharge } from '../models/Recharge';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { UserRoleModel } from '../models/UserRole';
import { CommissionRule } from '../models/CommissionRule';

dotenv.config();

// 数据库配置 - 本地MySQL
const sequelize = new Sequelize({
  database: 'payboard',
  username: 'root',
  password: '12345678',
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 60000,
    idle: 30000,
    evict: 60000
  },
  retry: {
    max: 3,
    timeout: 3000
  },
  models: [Member, Worker, Order, Recharge, User, Role, UserRoleModel, CommissionRule],
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});

export { sequelize };
export default sequelize;