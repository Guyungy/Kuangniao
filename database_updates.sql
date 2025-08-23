-- =====================================================
-- 数据库更新脚本 - 合并版本
-- 包含以下更新：
-- 1. 为 workers 表添加 account_name 字段
-- 2. 为 recharges 表添加充值相关字段
-- 3. 为 recharges 表添加状态管理字段
-- =====================================================

-- =====================================================
-- 1. 为 workers 表添加 account_name 字段
-- =====================================================
ALTER TABLE workers ADD COLUMN account_name VARCHAR(50) COMMENT '开户姓名';

-- =====================================================
-- 2. 为 recharges 表添加充值相关字段
-- =====================================================

-- 添加充值编号字段
ALTER TABLE recharges ADD COLUMN recharge_no VARCHAR(50) NOT NULL UNIQUE COMMENT '充值编号';

-- 添加操作人ID字段
ALTER TABLE recharges ADD COLUMN operator_id INT NOT NULL COMMENT '操作人ID';

-- 添加操作人姓名字段
ALTER TABLE recharges ADD COLUMN operator_name VARCHAR(50) NOT NULL COMMENT '操作人姓名';

-- 为现有记录生成充值编号和设置默认操作人
UPDATE recharges SET 
  recharge_no = CONCAT('RC', UNIX_TIMESTAMP() * 1000 + id, LPAD(id, 3, '0')),
  operator_id = 1,
  operator_name = 'admin'
WHERE recharge_no IS NULL;

-- =====================================================
-- 3. 为 recharges 表添加状态管理字段
-- =====================================================

-- 添加充值记录状态字段
ALTER TABLE recharges ADD COLUMN status ENUM('active', 'cancelled') NOT NULL DEFAULT 'active' COMMENT '状态：active-有效，cancelled-已取消';

-- 添加取消操作人ID字段
ALTER TABLE recharges ADD COLUMN cancelled_by INT NULL COMMENT '取消操作人ID';

-- 添加取消操作人姓名字段
ALTER TABLE recharges ADD COLUMN cancelled_by_name VARCHAR(50) NULL COMMENT '取消操作人姓名';

-- 添加取消时间字段
ALTER TABLE recharges ADD COLUMN cancelled_at DATETIME NULL COMMENT '取消时间';

-- =====================================================
-- 更新完成
-- =====================================================
