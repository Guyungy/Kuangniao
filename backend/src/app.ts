import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// 路由导入
import memberRoutes from './routes/members';
import rechargeRoutes from './routes/recharges';
import orderRoutes from './routes/orders';
import workerRoutes from './routes/workers';
import reportRoutes from './routes/reports';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import logRoutes from './routes/logs';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: true, // 允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/recharges', rechargeRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/logs', logRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// 错误处理中间件
app.use(errorHandler);

// 数据库连接和服务器启动
async function startServer() {
  try {
    // 测试数据库连接
    console.log('🔌 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // 同步数据库模型
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ force: false });
    console.log('✅ Database models synchronized.');
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    console.error('Please check your database configuration and make sure MySQL is running.');
    process.exit(1);
  }
}

startServer();

export default app;

