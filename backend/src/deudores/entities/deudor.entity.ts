import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('deudores')
export class Deudor {
  @ObjectIdColumn()
  _id: string;

  @Column()
  numero_identificacion: number;

  @Column()
  situacion_desfavorable: number;

  @Column()
  suma_prestamos: number;

  @Column()
  codigo_entidad: string;
}