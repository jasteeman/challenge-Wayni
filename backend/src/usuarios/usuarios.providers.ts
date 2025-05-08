import { Usuario } from './entities/usuario.entity';

export const usuarioProviders = [
  {
    provide: 'usuario',
    useValue: Usuario,
  },
];