# 🎮 叨叨电竞 - 网吧代练管理系统

> 基于 Vue3 + Node.js + TypeScript 的现代化网吧代练管理系统

[![Vue3](https://img.shields.io/badge/Vue-3.5.18-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 项目简介

叨叨电竞是一个专为网吧代练业务设计的全栈管理系统，提供会员管理、充值管理、订单管理、打手管理等核心功能。系统采用前后端分离架构，具备现代化的用户界面和强大的后台管理能力。

### 🎯 核心功能

- **会员管理** - 会员信息管理、充值记录、消费记录
- **充值管理** - 会员充值、支付方式管理、充值流水
- **订单管理** - 代练订单创建、状态跟踪、支付处理
- **打手管理** - 打手信息管理、接单统计、绩效分析
- **报表中心** - 数据可视化、趋势分析、排行榜
- **实时通知** - 企业微信群推送、订单状态更新

## 🛠 技术栈

### 前端 (Frontend)
- **框架**: Vue 3.5.18 + TypeScript
- **构建工具**: Vite 6.0.1
- **UI 组件库**: Element Plus 2.10.5
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **HTTP 客户端**: Axios 1.11.0
- **图表**: ECharts 5.6.0
- **代码规范**: ESLint + Prettier + Stylelint

### 后端 (Backend)
- **运行时**: Node.js 18+
- **框架**: Express 4.18.2 + TypeScript
- **数据库**: MySQL 8.0+
- **ORM**: Sequelize 6.35.2 + Sequelize-TypeScript
- **认证**: JWT + bcryptjs
- **验证**: Joi + express-validator
- **安全**: Helmet + CORS

### 开发工具
- **包管理器**: pnpm 10.15.0
- **并发运行**: concurrently 8.2.2
- **代码提交**: Husky + commitlint
- **数据库同步**: Sequelize CLI

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL >= 8.0.0

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd daodao

# 安装所有依赖（根目录、后端、前端）
npm run install:all
```

### 环境配置

1. **后端环境变量** (`backend/.env`)
```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=payboard_db

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# 服务器配置
PORT=3000
NODE_ENV=development
```

2. **前端环境变量** (`frontend/.env`)
```env
# API 基础路径
VITE_API_BASE_URL=http://localhost:3000/api

# 应用配置
VITE_APP_TITLE=叨叨电竞
VITE_APP_VERSION=3.3.1
```

### 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE payboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 同步数据库表结构
cd backend
npm run db:sync

# 执行数据库更新脚本（如果需要）
mysql -u root -p payboard_db < database_updates.sql
```

### 启动开发环境

```bash
# 同时启动前后端开发服务器
npm run dev:full
```

访问地址：
- 前端: http://localhost:5173
- 后端 API: http://localhost:3000

## 📁 项目结构

```
daodao/
├── frontend/                 # 前端项目
│   ├── src/
│   │   ├── api/             # API 接口
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 通用组件
│   │   ├── composables/     # Vue3 组合式函数
│   │   ├── constants/       # 常量定义
│   │   ├── directive/       # 自定义指令
│   │   ├── enums/          # 枚举定义
│   │   ├── layouts/        # 布局组件
│   │   ├── plugins/        # 插件配置
│   │   ├── router/         # 路由配置
│   │   ├── store/          # 状态管理
│   │   ├── styles/         # 样式文件
│   │   ├── types/          # TypeScript 类型
│   │   ├── utils/          # 工具函数
│   │   └── views/          # 页面组件
│   ├── public/             # 公共资源
│   └── package.json
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # 路由定义
│   │   ├── services/       # 业务逻辑
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数
│   │   └── app.ts          # 应用入口
│   ├── scripts/            # 数据库脚本
│   └── package.json
├── package.json            # 根目录配置
└── README.md
```

## 🎨 功能特性

### 会员管理
- ✅ 会员信息 CRUD 操作
- ✅ 会员搜索（昵称、手机号）
- ✅ 会员详情页（充值记录、消费记录）
- ✅ 会员状态管理

### 充值管理
- ✅ 会员充值操作
- ✅ 多种支付方式支持
- ✅ 充值流水记录
- ✅ 企业微信群推送通知

### 订单管理
- ✅ 代练订单创建
- ✅ 订单状态跟踪
- ✅ 多种支付方式（余额、扫码、混合）
- ✅ 优惠金额管理
- ✅ 订单搜索和筛选

### 打手管理
- ✅ 打手信息管理
- ✅ 打手接单统计
- ✅ 绩效分析
- ✅ 状态管理

### 报表中心
- ✅ 今日概览数据
- ✅ 趋势图表分析
- ✅ 排行榜展示
- ✅ 数据导出功能

## 🔧 开发命令

### 根目录命令
```bash
# 安装所有依赖
npm run install:all

# 同时启动前后端开发服务器
npm run dev:full

# 构建所有项目
npm run build:all
```

### 前端命令
```bash
cd frontend

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 代码检查
pnpm lint

# 类型检查
pnpm type-check
```

### 后端命令
```bash
cd backend

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm start

# 数据库同步
npm run db:sync
```

## 📊 数据库设计

### 核心表结构
- `members` - 会员信息表
- `recharges` - 充值记录表
- `orders` - 订单记录表
- `workers` - 打手信息表
- `users` - 系统用户表

### 数据库更新脚本
项目包含一个合并的数据库更新脚本 `database_updates.sql`，包含以下更新：
- 为 `workers` 表添加 `account_name` 字段（开户姓名）
- 为 `recharges` 表添加充值相关字段（充值编号、操作人信息）
- 为 `recharges` 表添加状态管理字段（状态、取消信息）

详细的数据库设计请参考：[数据库表字段设计表.md](数据库表字段设计表.md)

## 🎯 系统导航

```
后台首页（Dashboard）
│
├── 会员管理
│    ├── 会员列表
│    │    └── 会员详情页
│    │         ├── 充值记录
│    │         └── 消费记录
│    └── 新增/编辑会员表单
│
├── 充值管理
│    ├── 充值记录列表
│    └── 新增充值表单
│
├── 订单管理
│    ├── 订单列表
│    └── 新增订单表单
│
├── 打手管理
│    ├── 打手列表
│    └── 新增/编辑打手表单
│
└── 报表中心
     ├── 今日概览
     ├── 趋势图
     └── 排行榜
```

详细的导航结构请参考：[系统导航结构.md](系统导航结构.md)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Conventional Commits 规范
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: PayBoard Team
- 邮箱: [your-email@example.com]
- 项目地址: [repository-url]

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Express](https://expressjs.com/) - Node.js Web 应用框架
- [Sequelize](https://sequelize.org/) - Node.js ORM

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！
