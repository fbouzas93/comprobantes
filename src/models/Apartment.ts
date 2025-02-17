import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';

@Table({ tableName: 'apartments', timestamps: false })
export class Apartment extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  description!: string;
}