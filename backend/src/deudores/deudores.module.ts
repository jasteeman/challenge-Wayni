import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deudor } from './entities/deudor.entity'; 
import { DeudoresService } from './services/deudores.service';
import { DeudoresController } from './controllers/deudores/deudores.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Deudor])],
  controllers: [DeudoresController],
  providers: [DeudoresService],
  exports: [DeudoresService],
})
export class DeudoresModule {}