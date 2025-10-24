/*
 Navicat Premium Dump SQL

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 90400 (9.4.0)
 Source Host           : 127.0.0.1:3306
 Source Schema         : payboard

 Target Server Type    : MySQL
 Target Server Version : 90400 (9.4.0)
 File Encoding         : 65001

 Date: 26/08/2025 18:51:15
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for commission_rules
-- ----------------------------
DROP TABLE IF EXISTS `commission_rules`;
CREATE TABLE `commission_rules`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则名称',
  `type` enum('global','level','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '规则类型：global-全局，level-级别，custom-自定义',
  `worker_level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '打手级别（仅level类型使用）',
  `worker_id` int NULL DEFAULT NULL COMMENT '打手ID（仅custom类型使用）',
  `commission_rate` decimal(5, 4) NOT NULL COMMENT '分成比例（0.0000-1.0000）',
  `min_amount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '最小金额限制',
  `max_amount` decimal(10, 2) NULL DEFAULT NULL COMMENT '最大金额限制',
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态',
  `priority` int NOT NULL DEFAULT 0 COMMENT '优先级（数字越大优先级越高）',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_worker_level`(`worker_level` ASC) USING BTREE,
  INDEX `idx_worker_id`(`worker_id` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_priority`(`priority` ASC) USING BTREE,
  CONSTRAINT `commission_rules_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '分成规则表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of commission_rules
-- ----------------------------
INSERT INTO `commission_rules` VALUES (1, '全局默认分成', 'global', NULL, NULL, 0.7000, 0.00, NULL, 'active', 0, '系统默认分成比例', '2025-08-25 15:00:00', '2025-08-25 15:00:00');
INSERT INTO `commission_rules` VALUES (2, 'SSR级别分成', 'level', 'SSR', NULL, 0.7500, 0.00, NULL, 'active', 10, 'SSR级别打手分成比例', '2025-08-25 15:00:00', '2025-08-25 15:00:00');
INSERT INTO `commission_rules` VALUES (3, '魔王级别分成', 'level', '魔王', NULL, 0.8000, 0.00, NULL, 'active', 20, '魔王级别打手分成比例', '2025-08-25 15:00:00', '2025-08-25 15:00:00');

-- ----------------------------
-- Table structure for members
-- ----------------------------
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会员昵称',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '手机号',
  `balance` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '当前余额',
  `total_recharge` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '累计充值金额',
  `total_consume` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '累计消费金额',
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_2`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_3`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_4`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_5`(`username` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_nickname`(`nickname` ASC) USING BTREE,
  INDEX `idx_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '会员表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of members
-- ----------------------------
INSERT INTO `members` VALUES (2, 'lisi', '李四', '13800138002', 90.00, 500.00, 410.00, 'active', '2025-08-23 04:59:48', '2025-08-26 13:35:18');
INSERT INTO `members` VALUES (3, 'wangwu', '王五', '13800138003', 0.00, 0.00, 0.00, 'active', '2025-08-23 04:59:48', '2025-08-23 15:45:14');
INSERT INTO `members` VALUES (4, '黎政', 'Liszt', '13823232323', 0.00, 0.01, 0.01, 'active', '2025-08-23 15:45:50', '2025-08-26 14:01:30');

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL COMMENT '会员ID',
  `worker_id` int NOT NULL COMMENT '打手ID',
  `duration` decimal(5, 2) NOT NULL COMMENT '服务时长（小时）',
  `price_origin` decimal(10, 2) NOT NULL COMMENT '原价（时长 × 单价）',
  `discount` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '优惠金额',
  `price_final` decimal(10, 2) NOT NULL COMMENT '实付金额',
  `pay_method` enum('balance','scan','mixed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式',
  `pay_balance` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '使用余额金额',
  `pay_scan` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '扫码支付金额',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '管理员备注（优惠原因/特殊情况说明）',
  `discount_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '优惠原因（当价格调整时必填）',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `start_time` datetime NULL DEFAULT NULL COMMENT '上钟时间（开始服务时间）',
  `end_time` datetime NULL DEFAULT NULL COMMENT '下钟时间（结束服务时间）',
  `status` enum('pending','in_service','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_member_id`(`member_id` ASC) USING BTREE,
  INDEX `idx_worker_id`(`worker_id` ASC) USING BTREE,
  INDEX `idx_pay_method`(`pay_method` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_6` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '订单表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (4, 2, 3, 1.00, 55.00, 0.00, 55.00, 'balance', 55.00, 0.00, '', NULL, '2025-08-23 13:17:10', '2025-08-26 12:55:10', '2025-08-23 16:51:16', '2025-08-26 12:55:10', 'completed');
INSERT INTO `orders` VALUES (5, 2, 3, 1.00, 55.00, 0.00, 55.00, 'balance', 55.00, 0.00, '', NULL, '2025-08-23 13:17:14', '2025-08-23 16:40:42', '2025-08-23 16:40:20', '2025-08-23 16:40:42', 'completed');
INSERT INTO `orders` VALUES (7, 2, 1, 1.00, 50.00, 0.00, 50.00, 'scan', 0.00, 50.00, '12', NULL, '2025-08-23 13:22:48', '2025-08-23 16:55:29', '2025-08-23 16:46:28', '2025-08-23 16:55:28', 'completed');
INSERT INTO `orders` VALUES (8, 4, 2, 1.00, 45.00, 0.00, 45.00, 'scan', 0.00, 45.00, '测试订单', NULL, '2025-08-23 16:24:23', '2025-08-23 16:43:15', '2025-08-23 16:35:16', '2025-08-23 17:35:16', 'completed');
INSERT INTO `orders` VALUES (9, 3, 1, 2.00, 100.00, 0.00, 100.00, 'scan', 0.00, 100.00, '', NULL, '2025-08-26 12:08:08', '2025-08-26 13:35:08', '2025-08-26 13:35:05', '2025-08-26 13:35:08', 'completed');
INSERT INTO `orders` VALUES (10, 4, 1, 1.00, 50.00, 49.99, 0.01, 'scan', 0.00, 0.01, '', '11', '2025-08-26 12:54:23', '2025-08-26 13:34:57', '2025-08-26 12:54:47', '2025-08-26 13:34:57', 'completed');
INSERT INTO `orders` VALUES (11, 4, 4, 2.00, 200.00, 199.99, 0.01, 'balance', 0.01, 0.00, '', '测试', '2025-08-26 12:59:54', '2025-08-26 13:34:55', '2025-08-26 12:59:57', '2025-08-26 13:34:55', 'completed');

-- ----------------------------
-- Table structure for recharges
-- ----------------------------
DROP TABLE IF EXISTS `recharges`;
CREATE TABLE `recharges`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL COMMENT '会员ID',
  `amount` decimal(10, 2) NOT NULL COMMENT '充值金额',
  `method` enum('balance','scan') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付方式',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `recharge_no` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '充值编号',
  `operator_id` int NOT NULL COMMENT '操作人ID',
  `operator_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作人姓名',
  `status` enum('active','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态：active-有效，cancelled-已取消',
  `cancelled_by` int NULL DEFAULT NULL COMMENT '取消操作人ID',
  `cancelled_by_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '取消操作人姓名',
  `cancelled_at` datetime NULL DEFAULT NULL COMMENT '取消时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `recharge_no`(`recharge_no` ASC) USING BTREE,
  UNIQUE INDEX `recharge_no_2`(`recharge_no` ASC) USING BTREE,
  UNIQUE INDEX `recharge_no_3`(`recharge_no` ASC) USING BTREE,
  UNIQUE INDEX `recharge_no_4`(`recharge_no` ASC) USING BTREE,
  INDEX `idx_member_id`(`member_id` ASC) USING BTREE,
  INDEX `idx_method`(`method` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  CONSTRAINT `recharges_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '充值记录表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of recharges
-- ----------------------------
INSERT INTO `recharges` VALUES (1, 3, 33.00, 'scan', '', '2025-08-23 13:02:37', '2025-08-23 13:13:00', 'RC1755925357907140', 1, 'admin', 'cancelled', 1, 'admin', '2025-08-23 13:13:00');
INSERT INTO `recharges` VALUES (2, 3, 2.00, 'scan', '111', '2025-08-23 13:12:53', '2025-08-23 15:45:12', 'RC1755925973524146', 1, 'admin', 'cancelled', 1, 'admin', '2025-08-23 15:45:12');
INSERT INTO `recharges` VALUES (3, 3, 32.00, 'scan', '', '2025-08-23 13:48:04', '2025-08-23 15:45:14', 'RC1755928084650899', 1, 'admin', 'cancelled', 1, 'admin', '2025-08-23 15:45:14');
INSERT INTO `recharges` VALUES (4, 4, 10.00, 'scan', '啊飒飒的阿萨大时代阿斯顿阿斯顿阿德阿萨阿斯顿阿斯顿阿萨', '2025-08-23 15:46:17', '2025-08-26 14:01:28', 'RC1755935177287536', 1, 'admin', 'cancelled', 2, 'lmm', '2025-08-26 14:01:28');
INSERT INTO `recharges` VALUES (5, 4, 0.01, 'scan', '2323', '2025-08-23 16:51:54', '2025-08-26 14:01:30', 'RC1755939114896078', 1, 'admin', 'cancelled', 2, 'lmm', '2025-08-26 14:01:30');
INSERT INTO `recharges` VALUES (6, 4, 0.01, 'scan', '1', '2025-08-26 14:01:22', '2025-08-26 14:01:22', 'RC1756188082501917', 2, 'lmm', 'active', NULL, NULL, NULL);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色编码',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '角色描述',
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name` ASC) USING BTREE,
  UNIQUE INDEX `code`(`code` ASC) USING BTREE,
  UNIQUE INDEX `name_2`(`name` ASC) USING BTREE,
  UNIQUE INDEX `code_2`(`code` ASC) USING BTREE,
  UNIQUE INDEX `name_3`(`name` ASC) USING BTREE,
  UNIQUE INDEX `code_3`(`code` ASC) USING BTREE,
  UNIQUE INDEX `name_4`(`name` ASC) USING BTREE,
  UNIQUE INDEX `code_4`(`code` ASC) USING BTREE,
  INDEX `idx_roles_status`(`status` ASC) USING BTREE,
  INDEX `idx_roles_code`(`code` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '角色表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, '系统管理员', 'ADMIN', '系统管理员，拥有所有权限', 'active', '2025-08-26 05:21:32', '2025-08-26 05:21:32');
INSERT INTO `roles` VALUES (2, '操作员', 'OPERATOR', '操作员，拥有基本操作权限', 'active', '2025-08-26 05:21:32', '2025-08-26 05:21:32');
INSERT INTO `roles` VALUES (3, '普通用户', 'USER', '普通用户，只有查看权限', 'active', '2025-08-26 05:21:32', '2025-08-26 05:21:32');
INSERT INTO `roles` VALUES (4, '管理员', '管理员', '管理员', 'disabled', '2025-08-26 13:38:45', '2025-08-26 13:42:24');
INSERT INTO `roles` VALUES (11, '超级管理员', 'ROOT', '拥有所有权限的超级管理员', 'active', '0000-00-00 00:00:00', '0000-00-00 00:00:00');

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '关联ID',
  `user_id` int NOT NULL COMMENT '用户ID',
  `role_id` int NOT NULL COMMENT '角色ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_role`(`user_id` ASC, `role_id` ASC) USING BTREE,
  INDEX `idx_user_roles_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_user_roles_role_id`(`role_id` ASC) USING BTREE,
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户角色关联表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_roles
-- ----------------------------
INSERT INTO `user_roles` VALUES (1, 1, 1, '2025-08-26 05:44:59');
INSERT INTO `user_roles` VALUES (4, 1, 11, '2025-08-26 07:03:52');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `display_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '显示名称',
  `role` enum('admin','operator') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'operator' COMMENT '角色',
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active' COMMENT '状态',
  `last_login_at` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_2`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_3`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_4`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_5`(`username` ASC) USING BTREE,
  UNIQUE INDEX `username_6`(`username` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', '$2a$10$8x3pmm7oIU24a9F0s/GfzOcYM1IgI0PrUQTL/nrbtLm0q7a2p9nBy', '系统管理员', 'admin', 'active', '2025-08-26 17:40:53', '2025-08-23 04:59:48', '2025-08-26 17:40:53');
INSERT INTO `users` VALUES (2, 'lmm', '$2a$10$8x3pmm7oIU24a9F0s/GfzOcYM1IgI0PrUQTL/nrbtLm0q7a2p9nBy', '系统管理员', 'admin', 'active', '2025-08-26 14:01:14', '2025-08-26 06:00:48', '2025-08-26 14:01:14');

-- ----------------------------
-- Table structure for worker_settlements
-- ----------------------------
DROP TABLE IF EXISTS `worker_settlements`;
CREATE TABLE `worker_settlements`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '对账ID',
  `worker_id` int NOT NULL COMMENT '打手ID',
  `settlement_type` enum('daily','weekly','monthly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '结算类型',
  `start_date` date NOT NULL COMMENT '结算开始日期',
  `end_date` date NOT NULL COMMENT '结算结束日期',
  `order_count` int NOT NULL DEFAULT 0 COMMENT '订单数量',
  `order_amount` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
  `total_hours` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '小时数',
  `hourly_rate` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '小时单价',
  `expected_amount` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '应得金额',
  `actual_amount` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '实发金额',
  `difference_amount` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '差额',
  `difference_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '差额说明',
  `status` enum('pending','confirmed','disputed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '核账状态',
  `confirmed_by` int NULL DEFAULT NULL COMMENT '核账操作人ID',
  `confirmed_at` datetime NULL DEFAULT NULL COMMENT '核账时间',
  `confirmation_note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '核账备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_worker_id`(`worker_id` ASC) USING BTREE,
  INDEX `idx_settlement_type`(`settlement_type` ASC) USING BTREE,
  INDEX `idx_start_date`(`start_date` ASC) USING BTREE,
  INDEX `idx_end_date`(`end_date` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `confirmed_by`(`confirmed_by` ASC) USING BTREE,
  CONSTRAINT `worker_settlements_ibfk_1` FOREIGN KEY (`worker_id`) REFERENCES `workers` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `worker_settlements_ibfk_2` FOREIGN KEY (`confirmed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '打手对账表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of worker_settlements
-- ----------------------------
INSERT INTO `worker_settlements` VALUES (1, 1, 'weekly', '2025-08-26', '2025-08-26', 1, 0.00, 1.00, 0.00, 0.00, 0.00, 0.00, '阿萨', 'disputed', NULL, NULL, NULL, '2025-08-26 14:29:57', '2025-08-26 16:21:12');
INSERT INTO `worker_settlements` VALUES (2, 1, 'monthly', '2025-08-01', '2025-08-31', 3, 150.01, 4.00, 50.00, 200.00, 0.00, -200.00, '管理员取消记录', 'disputed', 1, '2025-08-26 17:47:42', NULL, '2025-08-26 17:10:27', '2025-08-26 17:47:42');
INSERT INTO `worker_settlements` VALUES (3, 3, 'daily', '2025-08-26', '2025-08-26', 0, 0.00, 0.00, 55.00, 0.00, 0.00, 0.00, '测试', 'disputed', 1, '2025-08-26 17:47:06', NULL, '2025-08-26 17:12:24', '2025-08-26 17:47:06');

-- ----------------------------
-- Table structure for workers
-- ----------------------------
DROP TABLE IF EXISTS `workers`;
CREATE TABLE `workers`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '打手昵称',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `id_number` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '身份证号',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
  `wechat_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信号',
  `bank_account` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '银行卡号',
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '开户行名称',
  `price_hour` decimal(10, 2) NOT NULL COMMENT '每小时单价',
  `type` enum('跑刀','陪玩','陪练','其他') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '可用' COMMENT '状态',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '管理员备注',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `account_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '开户姓名',
  `skills` json NULL COMMENT '技能标签数组',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'A' COMMENT '打手级别：A、S、SSR、魔王',
  `is_cancelled` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否已取消（软删除）',
  `cancelled_at` datetime NULL DEFAULT NULL COMMENT '取消时间',
  `cancel_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '取消原因',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_name`(`name` ASC) USING BTREE,
  INDEX `idx_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_type`(`type` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_created_at`(`created_at` ASC) USING BTREE,
  INDEX `idx_workers_is_cancelled`(`is_cancelled` ASC) USING BTREE,
  INDEX `idx_workers_cancelled_at`(`cancelled_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '打手表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of workers
-- ----------------------------
INSERT INTO `workers` VALUES (1, 'Masons', '李美美', '110101199001011234', '13900139001', 'xiaoming_wx', '', '中国工商银行', 50.00, '跑刀', '可用', NULL, '2025-08-23 04:59:48', '2025-08-26 13:35:08', 'as d', '[\"跑刀\", \"女陪\"]', 'SSR', 0, NULL, NULL);
INSERT INTO `workers` VALUES (2, 'Liszt', '黎政', '110101199002022345', '13900139002', 'xiaohong_wx', '', '中国工商银行', 45.00, '跑刀', '忙碌', NULL, '2025-08-23 04:59:48', '2025-08-23 16:35:16', '22', '[\"娱乐\", \"护航\", \"跑刀\"]', '魔王', 0, NULL, NULL);
INSERT INTO `workers` VALUES (3, '小刚', '王小刚', '110101199003033456', '13900139003', 'xiaogang_wx', NULL, NULL, 55.00, '陪练', '禁用', NULL, '2025-08-23 04:59:48', '2025-08-26 12:59:09', NULL, NULL, 'A', 0, NULL, NULL);
INSERT INTO `workers` VALUES (4, '扣1', '周文涛', '340421200312303413', '15968094178', NULL, '6230910299074332762', '兴业银行', 100.00, '跑刀', '可用', NULL, '2025-08-26 12:58:44', '2025-08-26 13:34:55', '周文涛', '[\"娱乐\", \"护航\"]', 'S', 0, NULL, NULL);

-- ----------------------------
-- Table structure for workers_backup
-- ----------------------------
DROP TABLE IF EXISTS `workers_backup`;
CREATE TABLE `workers_backup`  (
  `id` int NOT NULL DEFAULT 0,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '打手昵称',
  `real_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `id_number` varchar(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '身份证号',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
  `wechat_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '微信号',
  `bank_account` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '银行卡号',
  `bank_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '开户行名称',
  `price_hour` decimal(10, 2) NOT NULL COMMENT '每小时单价',
  `type` enum('跑刀','陪玩','陪练','其他') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型',
  `status` enum('待审核','在职','禁用') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待审核' COMMENT '状态',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `account_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '开户姓名'
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of workers_backup
-- ----------------------------
INSERT INTO `workers_backup` VALUES (1, '小明', '张小明', '110101199001011234', '13900139001', 'xiaoming_wx', NULL, NULL, 50.00, '跑刀', '禁用', NULL, '2025-08-23 04:59:48', '2025-08-23 15:52:27', NULL);
INSERT INTO `workers_backup` VALUES (2, '小红', '李小红', '110101199002022345', '13900139002', 'xiaohong_wx', '110101199002022345', '中国工商银行', 45.00, '跑刀', '禁用', NULL, '2025-08-23 04:59:48', '2025-08-23 13:43:05', '22');
INSERT INTO `workers_backup` VALUES (3, '小刚', '王小刚', '110101199003033456', '13900139003', 'xiaogang_wx', NULL, NULL, 55.00, '陪练', '禁用', NULL, '2025-08-23 04:59:48', '2025-08-23 15:52:33', NULL);

SET FOREIGN_KEY_CHECKS = 1;
