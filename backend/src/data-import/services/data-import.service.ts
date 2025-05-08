import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as readline from 'readline';
import { DeudoresService } from 'src/deudores/services/deudores.service';
import { EntidadesService } from 'src/entidades/services/entidades.service';

interface RegistroDeudorRaw {
  codigo_entidad: string;
  fecha_informacion: string;
  tipo_identificacion: string;
  nro_identificacion: string;
  actividad: string;
  situacion: string;
  prestamos: string;
}

@Injectable()
export class DataImportService {
  constructor(
    private readonly deudoresService: DeudoresService,
    private readonly entidadesService: EntidadesService,
  ) {}

  async importarDatos(filePath: string): Promise<void> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const deudoresAgrupados: { [nroIdentificacion: string]: { suma_prestamos: number; situacion_desfavorable: number; numero_identificacion: number, codigo_entidad:string } } = {};
    const entidadesAgrupadas: { [codigoEntidad: string]: { suma_prestamos: number; codigo_entidad: number } } = {};

    for await (const line of rl) {
      const registroRaw = this.parsearLinea(line);
      if (registroRaw) {
        // Procesar para deudores
        const nroIdentificacion = registroRaw.nro_identificacion.trim();
        const situacion = parseInt(registroRaw.situacion.trim(), 10);
        const prestamos = parseFloat(registroRaw.prestamos.trim().replace(',', '.'));

        if (deudoresAgrupados[nroIdentificacion]) {
          deudoresAgrupados[nroIdentificacion].suma_prestamos += prestamos;
          deudoresAgrupados[nroIdentificacion].situacion_desfavorable = Math.max(
            deudoresAgrupados[nroIdentificacion].situacion_desfavorable,
            situacion,
          );
        } else {
          deudoresAgrupados[nroIdentificacion] = { suma_prestamos: prestamos, situacion_desfavorable: situacion, numero_identificacion: parseInt(nroIdentificacion, 10),codigo_entidad: registroRaw.codigo_entidad.trim() };
        }

        // Procesar para entidades
        const codigoEntidad = registroRaw.codigo_entidad.trim();
        if (entidadesAgrupadas[codigoEntidad]) {
          entidadesAgrupadas[codigoEntidad].suma_prestamos += prestamos;
        } else {
          entidadesAgrupadas[codigoEntidad] = { suma_prestamos: prestamos, codigo_entidad: parseInt(codigoEntidad, 10) };
        }
      }
    }

    // Guardar en la base de datos
    for (const nroIdentificacion in deudoresAgrupados) {
      await this.deudoresService.saveOrUpdate({
        _id: nroIdentificacion,
        situacion_desfavorable: deudoresAgrupados[nroIdentificacion].situacion_desfavorable,
        suma_prestamos: deudoresAgrupados[nroIdentificacion].suma_prestamos,
        numero_identificacion: deudoresAgrupados[nroIdentificacion].numero_identificacion,
        codigo_entidad: deudoresAgrupados[nroIdentificacion].codigo_entidad
      });
    }

    for (const codigoEntidad in entidadesAgrupadas) {
      await this.entidadesService.saveOrUpdate({
        _id: codigoEntidad,
        suma_prestamos: entidadesAgrupadas[codigoEntidad].suma_prestamos,
        codigo_entidad: entidadesAgrupadas[codigoEntidad].codigo_entidad,
      });
    }

    console.log('Importación completada.');
  }

  private parsearLinea(line: string): RegistroDeudorRaw | null {
    if (!line.trim()) {
      return null;
    }
    try {
      return {
        codigo_entidad: line.substring(0, 5),
        fecha_informacion: line.substring(5, 11),
        tipo_identificacion: line.substring(11, 13),
        nro_identificacion: line.substring(13, 24),
        actividad: line.substring(24, 27),
        situacion: line.substring(27, 29),
        prestamos: line.substring(29, 42).trim(),
      };
    } catch (error) {
      console.error('Error al parsear la línea:', line, error);
      return null;
    }
  }
}