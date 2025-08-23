-- 更新打手状态枚举值
-- 将旧状态映射到新状态

-- 更新数据库中的状态值
UPDATE workers SET status = '可用' WHERE status = '在职';
UPDATE workers SET status = '可用' WHERE status = '待审核';

-- 注意：'禁用'状态保持不变

-- 验证更新结果
SELECT status, COUNT(*) as count FROM workers GROUP BY status;
