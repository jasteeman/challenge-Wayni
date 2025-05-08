import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EntidadesModule } from './entidades.module';
import { EntidadesService } from './services/entidades.service';
import { Entidad } from './entities/entidad.entity';
import { DataSource, MongoRepository } from 'typeorm';

describe('EntidadesModule', () => {
  let entidadesModule: TestingModule;
  let entidadesService: EntidadesService;
  let entidadRepository: MongoRepository<Entidad>;
  let dataSource: DataSource;

  beforeEach(async () => {
    entidadesModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: 'mongodb://localhost/test',
          database: 'test_db',
          entities: [Entidad],
          synchronize: true,
          dropSchema: true,
        }),
        EntidadesModule,
      ],
    }).compile();
    dataSource = entidadesModule.get<DataSource>(DataSource);

    entidadesService = entidadesModule.get<EntidadesService>(EntidadesService);
    entidadRepository = entidadesModule.get<MongoRepository<Entidad>>(getRepositoryToken(Entidad));
  }); 
  
  it('debería estar definido', () => {
    expect(entidadesModule).toBeDefined();
    expect(entidadesService).toBeDefined();
  });
  
  it('debería proveer el EntidadesService', () => {
    expect(entidadesService).toBeInstanceOf(EntidadesService);
  });
 
});
