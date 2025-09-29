import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Table({
  tableName: 'products',
  timestamps: true,
  underscored: true
})
export class Product extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({ type: DataType.STRING(100), allowNull: false, comment: '商品名称' })
  name!: string;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false, defaultValue: 0, comment: '商品单价' })
  price!: number;

  @Column({ type: DataType.DECIMAL(5, 4), allowNull: false, defaultValue: 0.0, comment: '分成比例 0-1' })
  commission_rate!: number;

  @Column({ type: DataType.ENUM(...Object.values(ProductStatus)), allowNull: false, defaultValue: ProductStatus.ACTIVE, comment: '状态' })
  status!: ProductStatus;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  created_at!: Date;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  updated_at!: Date;
}

export default Product;


