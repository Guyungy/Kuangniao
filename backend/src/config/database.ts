import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

// 导入模型
import { Member } from '../models/Member';
import { Worker } from '../models/Worker';
import { Order } from '../models/Order';
import { Recharge } from '../models/Recharge';
import { User } from '../models/User';

dotenv.config();

// 数据库配置
const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'payboard',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
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
  models: [Member, Worker, Order, Recharge, User],
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