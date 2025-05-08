import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MongoRepository } from 'typeorm';  
import { Entidad } from '../entities/entidad.entity';
import { CreateEntityDto } from '../dto/create-entity.dto';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

@Injectable()
export class EntidadesService {
  constructor(
    @InjectRepository(Entidad)
    private readonly entidadRepository: MongoRepository<Entidad>,
  ) {}

  async saveOrUpdate(entidadData: CreateEntityDto): Promise<Entidad> {
    const existingEntidad = await this.entidadRepository.findOne({ where: { _id: entidadData._id } });

    if (existingEntidad) {
      return this.entidadRepository.save({
        ...existingEntidad,
        suma_prestamos: existingEntidad.suma_prestamos + entidadData.suma_prestamos,
      });
    } else {
      const nuevaEntidad = this.entidadRepository.create(entidadData);
      return this.entidadRepository.save(nuevaEntidad);
    }
  }

  
  async findAll(options: PaginationOptions): Promise<PaginatedResult<Entidad>> {
      const { page, limit, q } = options;
  
      const safePage = page ?? 1;
      const safeLimit = limit ?? 10;
  
      const skip = (safePage - 1) * safeLimit;
  
      const [entidades, total] = await this.entidadRepository.findAndCount({
        skip,
        take: safeLimit,
        where: q ? { _id: Like(`%${q}%`) } : {},
      });
  
      return {
        data: entidades,
        total: total,
        totalPages: Math.ceil(total / safeLimit),
        page: safePage,
        limit: safeLimit,
  
      };
    }
    
    async findById(id: string): Promise<Entidad | null> {
      return this.entidadRepository.findOne({ where: { _id: id } });
    }
    
    async deleteById(id: string): Promise<void> {
      await this.entidadRepository.delete({ _id: id });
    }
}