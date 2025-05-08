import { Module } from '@nestjs/common';
import { Usuario } from './entities/usuario.entity';
import { UsuariosController } from './controllers/usuarios.controller';
import { UsuariosService } from './services/usuarios.service';
import { usuarioProviders } from './usuarios.providers';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService, ...usuarioProviders],
  exports:[UsuariosService]
})
export class UsuariosModule {}