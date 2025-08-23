-- 为workers表添加level和skills字段

-- 添加级别字段
ALTER TABLE workers ADD COLUMN level VARCHAR(20) DEFAULT 'A' COMMENT '打手级别：A、S、SSR、魔王';

-- 添加技能标签字段（JSON格式存储多个技能）
ALTER TABLE workers ADD COLUMN skills JSON DEFAULT '[]' COMMENT '技能标签数组';

-- 更新现有数据，设置默认级别
UPDATE workers SET level = 'A' WHERE level IS NULL;

-- 更新现有数据，设置默认技能
UPDATE workers SET skills = '[]' WHERE skills IS NULL;

-- 验证字段添加结果
SHOW COLUMNS FROM workers LIKE 'level';
SHOW COLUMNS FROM workers LIKE 'skills';

-- 查看更新后的数据
SELECT id, name, level, skills FROM workers LIMIT 5;
