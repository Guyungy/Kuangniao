import { Table, Column, Model, DataType, HasMany, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Order } from './Order';

export enum WorkerType {
  RUNNER = '跑刀',
  COMPANION = '陪玩',
  TRAINER = '陪练',
  OTHER = '其他'
}

export enum WorkerStatus {
  PENDING = '待审核',
  ACTIVE = '在职',
  DISABLED = '禁用'
}

@Table({
  tableName: 'workers',
  timestamps: true,
  underscored: true
})
export class Worker extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '打手昵称'
  })
  name!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: '真实姓名'
  })
  real_name!: string;

  @Column({
    type: DataType.STRING(18),
    allowNull: false,
    comment: '身份证号'
  })
  id_number!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    comment: '联系电话'
  })
  phone!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '微信号'
  })
  wechat_id?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '银行卡号'
  })
  bank_account?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: '开户行名称'
  })
  bank_name?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: '开户姓名'
  })
  account_name?: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '每小时单价'
  })
  price_hour!: number;

  @Column({
    type: DataType.ENUM(...Object.values(WorkerType)),
    allowNull: false,
    comment: '类型'
  })
  type!: WorkerType;

  @Column({
    type: DataType.ENUM(...Object.values(WorkerStatus)),
    allowNull: false,
    defaultValue: WorkerStatus.PENDING,
    comment: '状态'
  })
  status!: WorkerStatus;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: '管理员备注'
  })
  remark?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: '添加时间'
  })
  created_at!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: '最近更新时间'
  })
  updated_at!: Date;

  // 关联关系
  @HasMany(() => Order)
  orders!: Order[];

  // 实例方法：脱敏显示身份证号
  getMaskedIdNumber(): string {
    if (!this.id_number || this.id_number.length < 10) {
      return this.id_number;
    }
    return this.id_number.substring(0, 6) + '****' + this.id_number.substring(this.id_number.length - 4);
  }

  // 实例方法：脱敏显示银行卡号
  getMaskedBankAccount(): string {
    if (!this.bank_account || this.bank_account.length < 8) {
      return this.bank_account || '';
    }
    return '****' + this.bank_account.substring(this.bank_account.length - 4);
  }

  // 静态方法：获取类型的中文描述
  static getTypeText(type: WorkerType): string {
    return type;
  }

  // 静态方法：获取状态的中文描述
  static getStatusText(status: WorkerStatus): string {
    return status;
  }

  // 检查是否可以接单
  canTakeOrder(): boolean {
    return this.status === WorkerStatus.ACTIVE || this.status === WorkerStatus.PENDING;
  }
}