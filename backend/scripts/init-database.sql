-- PayBoard 数据库初始化脚本（与 Sequelize 模型严格对齐）
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `payboard` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `payboard`;

-- 用户表（后台管理员）
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `display_name` varchar(100) DEFAULT NULL COMMENT '显示名称',
  `role` enum('admin','user') NOT NULL DEFAULT 'user' COMMENT '角色',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active' COMMENT '状态',
  `last_login_at` datetime DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 会员表（与 src/models/Member.ts 对齐）
CREATE TABLE IF NOT EXISTS `members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE COMMENT '用户名',
  `nickname` varchar(50) NOT NULL COMMENT '会员昵称',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机号',
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '余额',
  `total_recharge` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '累计充值',
  `total_consume` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '累计消费',
  `status` enum('active','disabled') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_nickname` (`nickname`),
  KEY `idx_phone` (`phone`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

-- 打手表（与 src/models/Worker.ts 对齐）
CREATE TABLE IF NOT EXISTS `workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL COMMENT '打手昵称',
  `real_name` varchar(50) NOT NULL COMMENT '真实姓名',
  `id_number` varchar(18) NOT NULL COMMENT '身份证号',
  `phone` varchar(20) NOT NULL COMMENT '联系电话',
  `wechat_id` varchar(50) DEFAULT NULL COMMENT '微信号',
  `bank_account` varchar(50) DEFAULT NULL COMMENT '银行卡号',
  `bank_name` varchar(100) DEFAULT NULL COMMENT '开户银行',
  `price_hour` decimal(10,2) NOT NULL COMMENT '每小时单价',
  `type` enum('跑刀','陪玩','陪练','其他') NOT NULL COMMENT '类型',
  `status` enum('待审核','在职','禁用') NOT NULL DEFAULT '待审核' COMMENT '状态',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_phone` (`phone`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='打手表';

-- 订单表（与 src/models/Order.ts 对齐）
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL COMMENT '会员ID',
  `worker_id` int(11) NOT NULL COMMENT '打手ID',
  `duration` decimal(5,2) NOT NULL COMMENT '服务时长(小时)',
  `price_origin` decimal(10,2) NOT NULL COMMENT '原价',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '优惠金额',
  `price_final` decimal(10,2) NOT NULL COMMENT '实付金额',
  `pay_method` enum('balance','scan','mixed') NOT NULL COMMENT '支付方式',
  `pay_balance` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '余额支付金额',
  `pay_scan` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '扫码支付金额',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_pay_method` (`pay_method`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_orders_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_worker` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 充值记录表（与 src/models/Recharge.ts 对齐）
CREATE TABLE IF NOT EXISTS `recharges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `member_id` int(11) NOT NULL COMMENT '会员ID',
  `amount` decimal(10,2) NOT NULL COMMENT '充值金额',
  `method` enum('balance','scan') NOT NULL COMMENT '充值方式',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_member_id` (`member_id`),
  KEY `idx_method` (`method`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_recharges_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='充值记录表';

-- 插入默认管理员用户 (密码: 123456)
INSERT INTO `users` (`username`, `password`, `display_name`, `role`, `status`) VALUES
('admin', '$2a$10$8x3pmm7oIU24a9F0s/GfzOcYM1IgI0PrUQTL/nrbtLm0q7a2p9nBy', '系统管理员', 'admin', 'active')
ON DUPLICATE KEY UPDATE `password` = '$2a$10$8x3pmm7oIU24a9F0s/GfzOcYM1IgI0PrUQTL/nrbtLm0q7a2p9nBy', `updated_at` = CURRENT_TIMESTAMP;

-- 插入测试数据（与模型字段一致）
-- 测试会员
INSERT INTO `members` (`username`, `nickname`, `phone`, `balance`, `total_recharge`, `total_consume`, `status`) VALUES
('zhangsan', '张三', '13800138001', 500.00, 1000.00, 500.00, 'active'),
('lisi', '李四', '13800138002', 200.00, 500.00, 300.00, 'active'),
('wangwu', '王五', '13800138003', 0.00, 0.00, 0.00, 'active')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- 测试打手
INSERT INTO `workers` (`name`, `real_name`, `id_number`, `phone`, `wechat_id`, `bank_account`, `bank_name`, `price_hour`, `type`, `status`) VALUES
('小明', '张小明', '110101199001011234', '13900139001', 'xiaoming_wx', NULL, NULL, 50.00, '跑刀', '在职'),
('小红', '李小红', '110101199002022345', '13900139002', 'xiaohong_wx', NULL, NULL, 45.00, '陪玩', '在职'),
('小刚', '王小刚', '110101199003033456', '13900139003', 'xiaogang_wx', NULL, NULL, 55.00, '陪练', '在职')
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

COMMIT;