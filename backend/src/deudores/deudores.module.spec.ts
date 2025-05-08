import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { DeudoresModule } from './deudores.module';
import { DeudoresService } from './services/deudores.service';
import { Deudor } from './entities/deudor.entity';
import { DataSource, MongoRepository } from 'typeorm';

describe('DeudoresModule', () => {
  let deudoresModule: TestingModule;
  let deudoresService: DeudoresService;
  let deudorRepository: MongoRepository<Deudor>; 
  let dataSource: DataSource;
     
  beforeEach(async () => { 
    deudoresModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
            type: 'mongodb',
            url: 'mongodb://localhost/test',
            database: 'test_db',
          entities: [Deudor],
          synchronize: true,
          dropSchema: true,
        }),
        DeudoresModule,
      ],
    }).compile();
    dataSource = deudoresModule.get<DataSource>(DataSource);
    deudoresService = deudoresModule.get<DeudoresService>(DeudoresService);
    deudorRepository = deudoresModule.get<MongoRepository<Deudor>>(getRepositoryToken(Deudor));
  });
 
  it('debería estar definido', () => {
    expect(deudoresModule).toBeDefined();
    expect(deudoresService).toBeDefined();
  });
  
  it('debería proveer el DeudoresService', () => {
    expect(deudoresService).toBeInstanceOf(DeudoresService);
  }); 
});
