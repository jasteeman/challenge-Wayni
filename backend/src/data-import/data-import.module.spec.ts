import { Test, TestingModule } from '@nestjs/testing';
import { DataImportModule } from './data-import.module';
import { DataImportService } from './services/data-import.service'; 
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Deudor } from 'src/deudores/entities/deudor.entity';
import { Entidad } from 'src/entidades/entities/entidad.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

describe('DataImportModule', () => {
  let dataImportModule: TestingModule;
  let dataImportService: DataImportService;
  let dataSource: DataSource;
  
  beforeEach(async () => {
   
    dataImportModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'mongodb',
          url: 'mongodb://localhost/test',
          database: 'test_db',
          entities: [Deudor, Entidad],
          synchronize: true,
          dropSchema: true,
        }),
        DataImportModule],
    }).compile();
    dataSource = dataImportModule.get<DataSource>(DataSource);
    dataImportService = dataImportModule.get<DataImportService>(DataImportService); 
  });

  it('debería estar definido', () => {
    expect(dataImportModule).toBeDefined();
  }); 
});
