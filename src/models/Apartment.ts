import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Service } from './Service';

@Table({ tableName: 'apartments', timestamps: false })
export class Apartment extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  description!: string;

  @HasMany(() => Service)
  services!: Service[];

  @Column({ type: DataType.SMALLINT, allowNull: false })
  order!: number;
}