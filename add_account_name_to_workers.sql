-- 添加 account_name 字段到 workers 表
ALTER TABLE workers ADD COLUMN account_name VARCHAR(50) COMMENT '开户姓名';
