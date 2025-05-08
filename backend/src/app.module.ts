import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { Usuario } from './usuarios/entities/usuario.entity';
import { DeudoresModule } from './deudores/deudores.module';
import { EntidadesModule } from './entidades/entidades.module';
import { DataImportModule } from './data-import/data-import.module';
import { DataImportController } from './data-import/controllers/data-import.controller';
import { DatabaseModule } from './common/databases/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Entidad } from './entidades/entities/entidad.entity';
import { Deudor } from './deudores/entities/deudor.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Usuario, Entidad, Deudor]),
    UsuariosModule,
    AuthModule, 
    DeudoresModule,
    EntidadesModule,
    DataImportModule,
  ],
  controllers: [AppController, DataImportController],
  providers: [AppService],
})
export class AppModule {}
