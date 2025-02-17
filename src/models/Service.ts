import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Apartment } from './Apartment';

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

  @ForeignKey(() => Apartment)
  @Column({ type: DataType.INTEGER, allowNull: false })
  apartment_id!: number;

  @BelongsTo(() => Apartment)
  apartment!: Apartment;
}
