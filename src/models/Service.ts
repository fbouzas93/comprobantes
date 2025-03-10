import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Apartment } from './Apartment';
import { Bill } from './Bill';

@Table({ tableName: 'services', timestamps: false })
export class Service extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.INTEGER, unique: true, allowNull: true })
  identifier_code!: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  drive_id!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_visible!: boolean;

  @ForeignKey(() => Apartment)
  @Column({ type: DataType.INTEGER, allowNull: false })
  apartment_id!: number;

  @BelongsTo(() => Apartment)
  apartment!: Apartment;

  @HasMany(() => Bill)
  bills!: Bill[];

  @Column({ type: DataType.BIGINT, allowNull: false })
  cuit!: number;
}
