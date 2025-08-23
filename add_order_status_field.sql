-- 为orders表添加状态字段

-- 添加订单状态字段
ALTER TABLE orders ADD COLUMN status ENUM('pending', 'in_service', 'completed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '订单状态';

-- 更新现有订单的状态
-- 根据上钟时间和下钟时间更新状态
UPDATE orders SET status = 'completed' WHERE start_time IS NOT NULL AND end_time IS NOT NULL;
UPDATE orders SET status = 'in_service' WHERE start_time IS NOT NULL AND end_time IS NULL;
UPDATE orders SET status = 'pending' WHERE start_time IS NULL;

-- 验证字段添加结果
SHOW COLUMNS FROM orders LIKE 'status';

-- 查看更新后的表结构
DESCRIBE orders;
