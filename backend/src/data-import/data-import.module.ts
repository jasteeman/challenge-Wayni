import { Module } from '@nestjs/common'; 
import { DeudoresModule } from '../deudores/deudores.module';
import { EntidadesModule } from '../entidades/entidades.module';
import { DataImportService } from './services/data-import.service';
import { DataImportController } from './controllers/data-import.controller';

@Module({
  imports: [DeudoresModule, EntidadesModule],
  controllers: [DataImportController],
  providers: [DataImportService],
  exports: [DataImportService],
})
export class DataImportModule {}