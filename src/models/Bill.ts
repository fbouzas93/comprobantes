import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Apartment } from './Apartment';
import { Service } from './Service';

@Table({ tableName: 'bills', timestamps: false })
export class Bill extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  amount!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  transaction_number!: number;

  @ForeignKey(() => Service)
  @Column({ type: DataType.INTEGER, allowNull: false })
  service_id!: number;

  @BelongsTo(() => Service)
  service!: Service;

  @ForeignKey(() => Apartment)
  @Column({ type: DataType.INTEGER, allowNull: false })
  apartment_id!: number;

  @BelongsTo(() => Apartment)
  apartment!: Apartment;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  created_at!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  payment_date!: Date;
}
