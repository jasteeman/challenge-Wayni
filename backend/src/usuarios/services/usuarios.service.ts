import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../entities/usuario.entity';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MongoRepository } from 'typeorm';
import { PaginatedResult, PaginationOptions } from 'src/common/utils/paginations.utils';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioModel: MongoRepository<Usuario>,
  ) { }

  async create(createUserDto: CreateUsuarioDto): Promise<Usuario> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.usuarioModel.save({ ...createUserDto, password: hashedPassword, enabled: true });
    return newUser;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<Usuario>> {
    const { page, limit, q } = options;

    const safePage = page ?? 1;
    const safeLimit = limit ?? 10;

    const skip = (safePage - 1) * safeLimit;

    const [usuarios, total] = await this.usuarioModel.findAndCount({
      skip,
      take: safeLimit,
      where: q ? { username: Like(`%${q}%`) } : {},
    });

    return {
      data: usuarios,
      total: total,
      totalPages: Math.ceil(total / safeLimit),
      page: safePage,
      limit: safeLimit,

    };
  }

  async findOne(id: string): Promise<Usuario | null> {
    try {
      const objectId = new ObjectId(id);
      const user = await this.usuarioModel.findOne({ where: { _id: objectId } });
      return user ? user as Usuario : null;
    } catch (error) {
      console.error("Error al buscar usuario:", error);
      return null;
    }
  }

  async findOneByUsername(username: string): Promise<Usuario | null> {
    if (!username || username.trim() === '') {
      throw new Error('Username is required');
    }
    const user = await this.usuarioModel.findOne({ where: { username } });
    return user ? user as Usuario : null;
  }

  async findOneByEmail(email: string): Promise<Usuario | null> {
    if (!email || email.trim() === '') {
      throw new Error('Email is required');
    }

    const user = await this.usuarioModel.findOne({ where: { email } });
    return user ? (user as Usuario) : null;
  }


  async update(id: string, updateUserDto: UpdateUsuarioDto): Promise<[number, Usuario[]]> {
    try {
      const existingUser = await this.findOne(id);
      if (!existingUser) {
        return [0, []];
      }

      if (updateUserDto.newPassword) {
        const trimmedPassword = updateUserDto.newPassword.trim();
        if (!trimmedPassword) {
          throw new Error('Password cannot be empty');
        }

        const isSamePassword = await bcrypt.compare(trimmedPassword, existingUser.password);
        if (!isSamePassword) {
          updateUserDto.password = await bcrypt.hash(trimmedPassword, 10);
        } else {
          delete updateUserDto.newPassword;
        }
      }
      const updateResult = await this.usuarioModel.update({ id: new ObjectId(id) }, updateUserDto);
      const affectedCount = updateResult.affected || 0;
      const updatedUsers = affectedCount > 0 ? [await this.findOne(id)] : [];
      return [affectedCount, updatedUsers as Usuario[]];
    } catch (error: any) {
      throw Error(error);
    }
  }

  async remove(id: string): Promise<void> {
    const user = await this.usuarioModel.findOne({ where: { id: new ObjectId(id) } });
    if (!user) {
      throw new Error('User not found');
    }

    await this.usuarioModel.remove(user);
  }

}