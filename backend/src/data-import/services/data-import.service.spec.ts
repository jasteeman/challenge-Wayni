import { Test, TestingModule } from '@nestjs/testing';
import { DataImportService } from './data-import.service';
import { DeudoresService } from 'src/deudores/services/deudores.service';
import { EntidadesService } from 'src/entidades/services/entidades.service';
import * as fs from 'fs';
import * as readline from 'readline';

const mockDeudoresService = {
  saveOrUpdate: jest.fn(),
};

const mockEntidadesService = {
  saveOrUpdate: jest.fn(),
};

jest.mock('fs');
jest.mock('readline');

describe('DataImportService', () => {
  let dataImportService: DataImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataImportService,
        { provide: DeudoresService, useValue: mockDeudoresService },
        { provide: EntidadesService, useValue: mockEntidadesService },
      ],
    }).compile();

    dataImportService = module.get<DataImportService>(DataImportService);
    // Limpiamos los mocks antes de cada test
    mockDeudoresService.saveOrUpdate.mockReset();
    mockEntidadesService.saveOrUpdate.mockReset();
    (fs.createReadStream as jest.Mock).mockReset();
    (readline.createInterface as jest.Mock).mockReset();
  });

  it('debería estar definido', () => {
    expect(dataImportService).toBeDefined();
  });

  describe('importarDatos', () => {
    it('debería procesar el archivo y guardar los datos en la base de datos', async () => {
      // Simular el contenido del archivo TXT
      const fileContent = `0000720170611200057178180001 60,6     ,0     7,5       ,0     ,0     ,0     60,6    ,0     ,0     7,5        ,0     0000000   
0000720170611200057176210001 94,8    ,0     75,0      ,0     ,0     ,0     94,8      ,0     ,0     75,0       ,0     0000000   
0000820170611200059069477021 4,3       ,0     ,8     ,0     ,0     ,0     4,3      ,0     ,0     ,8     ,0     0000000   `;

      const mockReadline = {
        on: (event: string, callback: (line: string) => void) => {
          if (event === 'line') {
            const lines = fileContent.split('\n');
            lines.forEach(line => callback(line));
          } else if (event === 'close') {
            callback('close');
          }
          return mockReadline;
        },
        [Symbol.asyncIterator]: () => {
          const lines = fileContent.split('\n');
          let index = 0;
          return {
            next: async () => {
              if (index < lines.length) {
                return { value: lines[index++], done: false };
              } else {
                return { value: undefined, done: true }
              }
            }
          }
        },
        close: () => { }
      };

      (fs.createReadStream as jest.Mock).mockReturnValue(Buffer.from(fileContent));
      (readline.createInterface as jest.Mock).mockReturnValue(mockReadline);

      // Llamar al método a probar
      await dataImportService.importarDatos('pruebaderuta/random/archivo.txt');

      expect(mockDeudoresService.saveOrUpdate).toHaveBeenCalledTimes(3);
      expect(mockDeudoresService.saveOrUpdate).toHaveBeenCalledWith({
        _id: '20005717818',
        situacion_desfavorable: 1,
        suma_prestamos: 60.6,
        numero_identificacion: 20005717818,
        codigo_entidad: '00007'
      });
      expect(mockDeudoresService.saveOrUpdate).toHaveBeenCalledWith({
        _id: '20005717621',
        situacion_desfavorable: 1,
        suma_prestamos: 94.8,
        numero_identificacion: 20005717621,
        codigo_entidad: '00007'
      });

      expect(mockEntidadesService.saveOrUpdate).toHaveBeenCalledTimes(2);
      expect(mockEntidadesService.saveOrUpdate).toHaveBeenCalledWith({
        _id: '00007',
        suma_prestamos: 155.4,
        codigo_entidad: 7
      });
      expect(mockEntidadesService.saveOrUpdate).toHaveBeenCalledWith({
        _id: '00008',
        suma_prestamos: 4.3,
        codigo_entidad: 8
      });
    });

    it('debería manejar líneas vacías o con formato incorrecto', async () => {
      // Simular un archivo con una línea vacía y una con formato incorrecto
      const fileContent = `0000720170611200057178180001 60,6     ,0     7,5       ,0     ,0     ,0     60,6    ,0     ,0     7,5        ,0     0000000   
      0000720170611200057176210001 94,8    ,0     75,0      ,0     ,0     ,0     94,8      ,0     ,0     75,0       ,0     0000000   
      0000820170611200059069477021 4,3       ,0     ,8     ,0     ,0     ,0     4,3      ,0     ,0     ,8     ,0     0000000   `;
      

      const mockReadline = {
        on: (event: string, callback: (line: string) => void) => {
          if (event === 'line') {
            const lines = fileContent.split('\n');
            lines.forEach(line => callback(line));
          } else if (event === 'close') {
            callback('close');
          }
          return mockReadline;
        },
        [Symbol.asyncIterator]: () => {
          const lines = fileContent.split('\n');
          let index = 0;
          return {
            next: async () => {
              if (index < lines.length) {
                return { value: lines[index++], done: false };
              } else {
                return { value: undefined, done: true }
              }
            }
          }
        },
        close: () => { }
      };
      (fs.createReadStream as jest.Mock).mockReturnValue(Buffer.from(fileContent));
      (readline.createInterface as jest.Mock).mockReturnValue(mockReadline);

      await dataImportService.importarDatos('cualquier/ruta/de/archivo.txt');

      // Verificar que solo se procesó la línea válida
      expect(mockDeudoresService.saveOrUpdate).toHaveBeenCalledTimes(2);
    });
  });
});
