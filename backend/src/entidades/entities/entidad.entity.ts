import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('entidades')
export class Entidad {
  @ObjectIdColumn()
  _id: string;

  @Column()
  codigo_entidad: number;

  @Column()
  suma_prestamos: number;
}