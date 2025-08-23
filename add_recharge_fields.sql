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
