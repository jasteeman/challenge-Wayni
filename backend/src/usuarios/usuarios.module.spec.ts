import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosModule } from './usuarios.module';
import { UsuariosService } from './services/usuarios.service';
import { UsuariosController } from './controllers/usuarios.controller';
import { usuarioProviders } from './usuarios.providers';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

describe('UsuariosModule', () => {
    let module: TestingModule;
    let dataSource: DataSource;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                UsuariosModule,
                TypeOrmModule.forRoot({
                    type: 'mongodb',
                    url: 'mongodb://localhost/test',
                    database: 'test_db',
                    entities: [Usuario],
                    synchronize: true,
                }),
            ],
        }).compile();
        dataSource = module.get<DataSource>(DataSource);

    }, 30000);

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should provide UsuariosService', () => {
        const service = module.get<UsuariosService>(UsuariosService);
        expect(service).toBeDefined();
    });

    it('should provide UsuariosController', () => {
        const controller = module.get<UsuariosController>(UsuariosController);
        expect(controller).toBeDefined();
    });

    it('should provide usuarioProviders', () => {
        usuarioProviders.forEach((provider) => {
            const provided = module.get(provider.provide);
            expect(provided).toBeDefined();
        });
    });

    it('should export UsuariosService', () => {
        const exportedService = module.get<UsuariosService>(UsuariosService);
        expect(exportedService).toBeDefined();
    });
});