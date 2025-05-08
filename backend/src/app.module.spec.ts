import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Entidad } from './entidades/entities/entidad.entity';
import { Deudor } from './deudores/entities/deudor.entity';
import { DataSource } from 'typeorm';
 
describe('AppModule', () => {
  let app: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: 'mongodb://localhost/test',
          database: 'testdb',
          entities: [Usuario,Entidad,Deudor],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();
    dataSource = app.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('should have the AppService provider', () => {
    const appService = app.get<AppService>(AppService);
    expect(appService).toBeDefined();
  });

  it('should import the UsuariosModule', () => {
    const usuariosModule = app.get(UsuariosModule);
    expect(usuariosModule).toBeDefined();
  });

  it('should import TypeOrmModule with correct configurations', () => {
    const typeOrmModule = app.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should load the configuration from .env file', () => {
    const configService = app.get(ConfigModule);
    expect(configService).toBeDefined();
  });
});
