import { Test, TestingModule } from '@nestjs/testing';
import { DataImportController } from './data-import.controller';
import { DataImportService } from '../services/data-import.service';
import * as fs from 'fs';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockDataImportService = {
  importarDatos: jest.fn(),
};

// Mock del módulo fs
jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('DataImportController', () => {
  let dataImportController: DataImportController;
  let dataImportService: DataImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataImportController],
      providers: [
        { provide: DataImportService, useValue: mockDataImportService },
      ],
    }).compile();

    dataImportController = module.get<DataImportController>(DataImportController);
    dataImportService = module.get<DataImportService>(DataImportService);
    // Limpiamos los mocks antes de cada test
    mockDataImportService.importarDatos.mockReset();
    (fs.writeFileSync as jest.Mock).mockReset();
    (fs.unlinkSync as jest.Mock).mockReset();
  });

  it('debería estar definido', () => {
    expect(dataImportController).toBeDefined();
  });

  describe('importarArchivo', () => {
    it('debería llamar al servicio de importación con la ruta del archivo y retornar un mensaje de éxito', async () => {
      // Simular un archivo subido
      const mockFile: Express.Multer.File = {
        originalname: 'test.txt',
        buffer: Buffer.from('contenido de prueba'),
      } as Express.Multer.File;

      // Configurar el mock para que no lance error
      mockDataImportService.importarDatos.mockResolvedValue(undefined);

      // Llamar al método a probar
      const resultado = await dataImportController.importarArchivo(mockFile);

      // Verificar que el servicio se llamó con la ruta correcta
      expect(mockDataImportService.importarDatos).toHaveBeenCalledWith('temp_test.txt');
      expect(fs.writeFileSync).toHaveBeenCalledWith('temp_test.txt', mockFile.buffer);
      expect(fs.unlinkSync).toHaveBeenCalledWith('temp_test.txt');
      expect(resultado).toBe('Importación de datos iniciada.');
    });

    it('debería retornar un mensaje de error si no se proporciona archivo', async () => {
      // Llamar al método sin archivo
      try {
        await dataImportController.importarArchivo(undefined as any);
      } catch (error) {
        // Verificar el mensaje de error
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('No se proporcionó ningún archivo.');
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
        expect(mockDataImportService.importarDatos).not.toHaveBeenCalled();
      }
    });

    it('debería manejar errores del servicio de importación y retornar un mensaje de error', async () => {
      // Simular un error lanzado por el servicio
      const errorMessage = 'Error al procesar los datos';
      mockDataImportService.importarDatos.mockRejectedValue(new Error(errorMessage));

      const mockFile: Express.Multer.File = {
        originalname: 'test.txt',
        buffer: Buffer.from('contenido de prueba'),
      } as Express.Multer.File;

      // Llamar al método que estamos probando
      try {
        await dataImportController.importarArchivo(mockFile);
      } catch (error) {
        // Verificar el mensaje de error
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(`Error durante la importación: ${errorMessage}`);
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(fs.writeFileSync).toHaveBeenCalledWith('temp_test.txt', mockFile.buffer);
        expect(fs.unlinkSync).toHaveBeenCalledWith('temp_test.txt');
      }
    });
  });
});
