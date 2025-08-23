import { Table, Column, Model, DataType, BelongsTo, ForeignKey, PrimaryKey, AutoIncrement } from 'sequelize-typescript';
import { Member } from './Member';
import { Worker } from './Worker';

export enum PayMethod {
  BALANCE = 'balance',
  SCAN = 'scan',
  MIXED = 'mixed'
}

@Table({
  tableName: 'orders',
  timestamps: true,
  underscored: true
})
export class Order extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Member)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '会员ID'
  })
  member_id!: number;

  @ForeignKey(() => Worker)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '打手ID'
  })
  worker_id!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    comment: '服务时长（小时）'
  })
  duration!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '原价（时长 × 单价）'
  })
  price_origin!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: '优惠金额'
  })
  discount?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
    comment: '实付金额'
  })
  price_final!: number;

  @Column({
    type: DataType.ENUM(...Object.values(PayMethod)),
    allowNull: false,
    comment: '支付方式'
  })
  pay_method!: PayMethod;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: '使用余额金额'
  })
  pay_balance?: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    comment: '扫码支付金额'
  })
  pay_scan?: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    comment: '管理员备注（优惠原因/特殊情况说明）'
  })
  remark?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
    comment: '下单时间'
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
  @BelongsTo(() => Member)
  member!: Member;

  @BelongsTo(() => Worker)
  worker!: Worker;

  // 静态方法：计算原价
  static calculateOriginPrice(duration: number, hourlyRate: number): number {
    return Number((Number(duration) * Number(hourlyRate)).toFixed(2));
  }

  // 静态方法：计算实付金额
  static calculateFinalPrice(originPrice: number, discount: number = 0): number {
    return Number((Number(originPrice) - Number(discount)).toFixed(2));
  }

  // 静态方法：获取支付方式的中文描述
  static getPayMethodText(method: PayMethod): string {
    const methodMap = {
      [PayMethod.BALANCE]: '余额支付',
      [PayMethod.SCAN]: '扫码支付',
      [PayMethod.MIXED]: '混合支付'
    };
    return methodMap[method] || method;
  }

  // 实例方法：验证支付金额
  validatePaymentAmounts(): boolean {
    const finalPrice = Number(this.price_final);
    const balanceAmount = Number(this.pay_balance || 0);
    const scanAmount = Number(this.pay_scan || 0);

    switch (this.pay_method) {
      case PayMethod.BALANCE:
        return balanceAmount === finalPrice && scanAmount === 0;
      case PayMethod.SCAN:
        return scanAmount === finalPrice && balanceAmount === 0;
      case PayMethod.MIXED:
        return Math.abs((balanceAmount + scanAmount) - finalPrice) < 0.01; // 允许0.01的浮点误差
      default:
        return false;
    }
  }

  // 实例方法：获取订单编号（格式化ID）
  getOrderNumber(): string {
    const date = new Date(this.created_at);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    return `ORD${dateStr}${this.id.toString().padStart(6, '0')}`;
  }
}