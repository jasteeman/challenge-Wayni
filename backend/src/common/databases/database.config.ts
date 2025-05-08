import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    type: 'mongodb',
    url: configService.get<string>('MONGODB_URI'),
    useUnifiedTopology: true,
    database: configService.get<string>('MONGODB_NAME'),
    username: configService.get<string>('MONGODB_USER'),
    password: configService.get<string>('MONGODB_PASSWORD'),
    autoLoadEntities: true, // Carga automáticamente las entidades
    synchronize: true,
  }),
};
