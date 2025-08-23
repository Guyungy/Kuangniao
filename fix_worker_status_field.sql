-- 修复workers表的status字段，确保能存储新的状态值

-- 查看当前status字段定义
SHOW COLUMNS FROM workers LIKE 'status';

-- 备份当前数据
CREATE TABLE workers_backup AS SELECT * FROM workers;

-- 修改status字段为VARCHAR，确保能存储中文状态值
ALTER TABLE workers MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT '可用';

-- 更新现有数据到新的状态值
UPDATE workers SET status = '可用' WHERE status = '在职';
UPDATE workers SET status = '禁用' WHERE status = '离职';
UPDATE workers SET status = '休息' WHERE status = '请假';

-- 验证更新结果
SELECT id, name, status FROM workers;

-- 检查是否有无效状态
SELECT DISTINCT status FROM workers;

-- 如果需要回滚，可以使用以下命令：
-- DROP TABLE workers;
-- RENAME TABLE workers_backup TO workers;
