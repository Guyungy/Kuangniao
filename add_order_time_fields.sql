-- 为orders表添加上钟时间和下钟时间字段

-- 添加上钟时间字段
ALTER TABLE orders ADD COLUMN start_time DATETIME NULL COMMENT '上钟时间（开始服务时间）';

-- 添加下钟时间字段
ALTER TABLE orders ADD COLUMN end_time DATETIME NULL COMMENT '下钟时间（结束服务时间）';

-- 验证字段添加结果
SHOW COLUMNS FROM orders LIKE 'start_time';
SHOW COLUMNS FROM orders LIKE 'end_time';

-- 查看更新后的表结构
DESCRIBE orders;
