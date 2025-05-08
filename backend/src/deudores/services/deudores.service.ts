import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MongoRepository } from 'typeorm';
import { Deudor } from '../entities/deudor.entity';
import { CreateDeudorDto } from '../dto/create-deudor.dto';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';

@Injectable()
export class DeudoresService {
  constructor(
    @InjectRepository(Deudor)
    private readonly deudorRepository: MongoRepository<Deudor>,
  ) { }

  async saveOrUpdate(deudorData: CreateDeudorDto): Promise<Deudor> {
    const existingDeudor = await this.deudorRepository.findOne({ where: { _id: deudorData._id } });

    if (existingDeudor) {
      return this.deudorRepository.save({
        ...existingDeudor,
        situacion_desfavorable: Math.max(existingDeudor.situacion_desfavorable, deudorData.situacion_desfavorable),
        suma_prestamos: existingDeudor.suma_prestamos + deudorData.suma_prestamos,
        codigo_entidad: existingDeudor.codigo_entidad
      });
    } else {
      const nuevoDeudor = this.deudorRepository.create(deudorData);
      return this.deudorRepository.save(nuevoDeudor);
    }
  }

  async findAll(id: string, options: PaginationOptions): Promise<PaginatedResult<Deudor>> {
    const { page, limit, q } = options;

    const safePage = page ?? 1;
    const safeLimit = limit ?? 10;

    const skip = (safePage - 1) * safeLimit;

    const [deudores, total] = await this.deudorRepository.findAndCount({
      skip,
      take: safeLimit,
      where: q
        ? {
          $or: [
            { numero_identificacion: { $regex: q, $options: 'i' } }
          ],
          codigo_entidad: id
        }
        : {},
    });

    return {
      data: deudores,
      total: total,
      totalPages: Math.ceil(total / safeLimit),
      page: safePage,
      limit: safeLimit,

    };
  }

  async findById(id: string): Promise<Deudor | null> {
    return this.deudorRepository.findOne({ where: { _id: id } });
  }

  async deleteById(id: string): Promise<void> {
    await this.deudorRepository.delete({ _id: id });
  }

}