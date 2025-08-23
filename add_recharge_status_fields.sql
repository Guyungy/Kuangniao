-- 添加充值记录状态字段
ALTER TABLE recharges ADD COLUMN status ENUM('active', 'cancelled') NOT NULL DEFAULT 'active' COMMENT '状态：active-有效，cancelled-已取消';

-- 添加取消操作人ID字段
ALTER TABLE recharges ADD COLUMN cancelled_by INT NULL COMMENT '取消操作人ID';

-- 添加取消操作人姓名字段
ALTER TABLE recharges ADD COLUMN cancelled_by_name VARCHAR(50) NULL COMMENT '取消操作人姓名';

-- 添加取消时间字段
ALTER TABLE recharges ADD COLUMN cancelled_at DATETIME NULL COMMENT '取消时间';
