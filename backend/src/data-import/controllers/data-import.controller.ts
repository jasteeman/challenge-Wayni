import { Controller, Post, UseInterceptors, HttpException, HttpStatus, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as Multer from 'multer';
import { Express } from 'express';
import { DataImportService } from '../services/data-import.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


type UploadedFile = Express.Multer.File;

@ApiTags('data-import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import')
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post('deudores')
  @UseInterceptors(FileInterceptor('archivo'))
  async importarArchivo(
    @UploadedFile() archivo: Express.Multer.File,
  ): Promise<string> {
    if (!archivo) {
      throw new HttpException(
        'No se proporcionó ningún archivo.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Guardar el archivo temporalmente
      const filePath = `temp_${archivo.originalname}`;
      require('fs').writeFileSync(filePath, archivo.buffer);
      await this.dataImportService.importarDatos(filePath);
      require('fs').unlinkSync(filePath);
      return 'Importación de datos iniciada.';
    } catch (error) {
      // Manejar el error correctamente y lanzar una excepción HttpException
      console.error('Error durante la importación:', error);
      throw new HttpException(
        `Error durante la importación: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
