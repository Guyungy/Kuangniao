# 🎮 狂鸟陪玩管理系统

> 基于 Vue3 + Node.js + TypeScript 的现代化网吧代练管理系统

[![Vue3](https://img.shields.io/badge/Vue-3.5.18-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 项目简介

狂鸟陪玩管理系统 是一个专为陪玩业务设计的全栈管理系统，提供会员管理、充值管理、订单管理、打手管理等核心功能。系统采用前后端分离架构，具备现代化的用户界面和强大的后台管理能力。

### 🎯 核心功能

- **会员管理** - 会员信息管理、充值记录、消费记录
- **财务管理** - 充值记录管理、分成规则设置、收益分配
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

### 本地开发部署

#### 1. 启动MySQL数据库
```bash
# 使用Docker启动MySQL（推荐）
docker run -d --name payboard-mysql -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=payboard \
  -e MYSQL_USER=app \
  -e MYSQL_PASSWORD=app123 \
  -v ${PWD}/payboard.sql:/docker-entrypoint-initdb.d/payboard.sql \
  mysql:8.0.43

# 或者使用本地MySQL服务
# 确保MySQL运行在3306端口，创建payboard数据库
```

#### 2. 导入数据库结构
```bash
# 导入数据库结构和初始数据
mysql -u root -p payboard < payboard.sql
```

#### 3. 启动后端服务
```bash
cd backend
pnpm install
pnpm dev
# 后端将在 http://localhost:10000 启动
```

#### 4. 启动前端服务
```bash
cd frontend
pnpm install
pnpm dev
# 前端将在 http://localhost:3001 启动
```

#### 5. 一键启动前后端（推荐）
```bash
# 在项目根目录执行
pnpm run dev:full
# 这将同时启动前端和后端服务
```

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd daodao

# 安装所有依赖（根目录、后端、前端）
pnpm run install:all
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
pnpm run dev:full
```

访问地址：
- 前端: http://localhost:3001
- 后端 API: http://localhost:10000

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
pnpm run install:all

# 同时启动前后端开发服务器
pnpm run dev:full

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

## 🐳 Docker 部署

### 前置条件
- 已安装并运行 Docker Desktop（Windows 11）

### 一键启动（生产模式）
1) 打开 PowerShell 并进入项目根目录：
```powershell
cd C:\Users\admin\Documents\GitHub\daodao
```
2) 启动（首次会自动构建镜像并导入 payboard.sql）：
```powershell
docker compose up -d
```
3) 访问与验证：
- 前端：`http://localhost/`
- 后端健康检查：`http://localhost:10000/health`
- phpMyAdmin：`http://localhost:8080`（root/root）
- 验证数据库导入：
```powershell
docker exec -it payboard-mysql mysql -uroot -proot -e "SHOW DATABASES; USE payboard; SHOW TABLES;"
```

说明：
- `docker-compose.yml` 已将 `payboard.sql` 以 init 脚本挂载到 `/docker-entrypoint-initdb.d/`，仅第一次启动会自动执行。
- 前端通过 Nginx 反代至后端，并将 `VITE_APP_BASE_API` 设为 `/api/v1`，与后端路由一致。

### 常用维护命令
- 查看状态与日志：
```powershell
docker compose ps
docker logs -f payboard-backend | cat
docker logs -f payboard-mysql | cat
```
- 重建镜像并热更新部署（修改了前端/后端代码或 compose）：
```powershell
docker compose up -d --build
```
- 清空数据卷并重新初始化数据库（重新导入 payboard.sql）：
```powershell
docker compose down -v
docker compose up -d
```

### 开发模式（热更新）
生产镜像 + Nginx 不支持秒级热更新，如需 HMR，请使用以下任一方案：

- 方案 A（推荐，最简单）：本机直接起 Vite Dev Server
  1) 前端目录安装依赖并启动：
  ```powershell
  cd frontend
  pnpm i
  pnpm dev
  ```
  2) 新建 `frontend/.env.local`：
  ```
  VITE_APP_BASE_API=http://localhost:10000/api/v1
  ```
  3) 访问 `http://localhost:5173`，保存即热更新。

- 方案 B（容器内开发）：使用 override 覆盖前端为 Dev Server
  新建 `docker-compose.override.yml`：
  ```yaml
  services:
    frontend:
      image: node:20-alpine
      working_dir: /app
      command: sh -c "npm i -g pnpm@9 && pnpm i && pnpm dev --host"
      volumes:
        - ./frontend:/app
      ports:
        - "5173:5173"
      environment:
        - VITE_APP_BASE_API=http://backend:10000/api/v1
      depends_on:
        - backend
  ```
  启动：
  ```powershell
  docker compose up -d
  ```
  访问 `http://localhost:5173`。

### 数据持久化与版本管理
- 不建议将 `mysql-data/` 加入版本控制（体积大、机器相关、易冲突）。建议在 `.gitignore` 中忽略：
```
mysql-data/
```
- 备份与迁移建议使用逻辑导出：
```powershell
mysqldump -h 127.0.0.1 -P 3306 -uroot -proot --databases payboard > backup.sql
```
- 可选：使用命名卷替代宿主机目录（更干净）
  - 将 compose 中：
    ```
    - ./mysql-data:/var/lib/mysql
    ```
    替换为：
    ```
    - payboard-mysql-data:/var/lib/mysql
    ```
  - 并在文件末尾添加：
    ```yaml
    volumes:
      payboard-mysql-data:
    ```

### 常见问题
- 3306 被占用：将 `"3306:3306"` 改为 `"3307:3306"` 后重启。
- 首次导入未触发：执行 `docker compose down -v` 再 `up -d`。
- Windows 挂载失败：在 Docker Desktop → Settings → Resources → File Sharing 中允许项目目录共享。

## 💰 财务管理功能

### 功能概述
财务管理模块整合了原有的充值管理功能，并新增了灵活的分成规则设置系统，支持多种分成策略和优先级管理。

### 主要特性

#### 1. 充值记录管理
- **充值操作**：支持会员余额充值和扫码充值
- **记录追踪**：完整的充值流水记录，包含操作人信息
- **状态管理**：支持充值记录的创建、取消等状态变更
- **余额更新**：自动更新会员余额和累计充值金额

#### 2. 分成规则设置
- **三种规则类型**：
  - **全局分成**：系统默认分成比例，适用于所有打手
  - **级别分成**：根据打手级别（A、S、SSR、魔王）设置不同分成
  - **自定义分成**：为特定打手设置个性化分成比例

- **优先级系统**：
  - 自定义分成 > 级别分成 > 全局分成
  - 数字越大优先级越高
  - 系统自动选择最高优先级的适用规则

- **灵活配置**：
  - 分成比例：0-100%（精确到小数点后4位）
  - 金额限制：可设置最小/最大金额限制
  - 状态管理：支持启用/禁用规则
  - 备注说明：详细的规则说明和备注

#### 3. 分成计算逻辑
```typescript
// 分成计算优先级
1. 自定义分成（worker_id 匹配）
2. 级别分成（worker_level 匹配）
3. 全局分成（默认规则）

// 示例：订单金额100元
- 全局分成：70% → 打手70元，平台30元
- SSR级别分成：75% → 打手75元，平台25元
- 自定义分成：80% → 打手80元，平台20元
```

### 数据库结构

#### commission_rules 表
```sql
CREATE TABLE `commission_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '规则名称',
  `type` enum('global','level','custom') NOT NULL COMMENT '规则类型',
  `worker_level` varchar(20) NULL COMMENT '打手级别',
  `worker_id` int NULL COMMENT '打手ID',
  `commission_rate` decimal(5,4) NOT NULL COMMENT '分成比例',
  `min_amount` decimal(10,2) NULL COMMENT '最小金额限制',
  `max_amount` decimal(10,2) NULL COMMENT '最大金额限制',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `priority` int NOT NULL DEFAULT 0 COMMENT '优先级',
  `remark` varchar(255) NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type`(`type`),
  INDEX `idx_priority`(`priority`)
);
```

### API接口

#### 分成规则管理
- `GET /api/v1/commission-rules` - 获取分成规则列表
- `GET /api/v1/commission-rules/:id` - 获取规则详情
- `POST /api/v1/commission-rules` - 创建新规则
- `PUT /api/v1/commission-rules/:id` - 更新规则
- `DELETE /api/v1/commission-rules/:id` - 删除规则

#### 分成计算
- `POST /api/v1/commission-rules/calculate` - 计算打手分成
  ```json
  {
    "worker_id": 1,
    "amount": 100.00,
    "worker_level": "SSR"
  }
  ```

### 使用说明

#### 1. 访问路径
- 财务管理：`/finance`
- 充值记录：`/finance/recharge`
- 分成设置：`/finance/commission`

#### 2. 创建分成规则
1. 进入"财务管理" → "分成设置"
2. 点击"新增规则"
3. 选择规则类型（全局/级别/自定义）
4. 设置分成比例和优先级
5. 保存规则

#### 3. 规则优先级示例
```typescript
// 假设有以下规则：
1. 全局默认分成：70%，优先级0
2. SSR级别分成：75%，优先级10
3. 魔王级别分成：80%，优先级20
4. 张三自定义分成：85%，优先级30

// 对于SSR级别的张三，系统会选择：
// 张三自定义分成（85%），因为优先级最高
```

### 技术实现

#### 后端实现
- **模型**：`CommissionRule` 继承 Sequelize Model
- **路由**：完整的RESTful API实现
- **验证**：使用 express-validator 进行参数验证
- **关联**：与 Worker 模型建立外键关联

#### 前端实现
- **页面**：基于 Element Plus 的管理界面
- **API**：完整的CRUD操作封装
- **状态管理**：响应式数据管理和表单验证
- **用户体验**：搜索、筛选、分页等交互功能

### 扩展建议
- **批量操作**：支持批量导入/导出分成规则
- **历史记录**：记录规则变更历史
- **审批流程**：重要规则变更需要审批
- **数据分析**：分成效果分析和优化建议
