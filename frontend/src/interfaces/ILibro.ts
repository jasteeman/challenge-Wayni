export interface Libro {
  id?: number;
  titulo: string;
  autor: string;
  editorial: string;
  precio: number;
  disponibilidad: boolean;
  genero: string;
  imagenUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}