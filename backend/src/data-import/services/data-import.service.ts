import { Injectable, Logger } from '@nestjs/common';
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
    private readonly logger = new Logger(DataImportService.name);

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

        const deudoresAgrupados: { [nroIdentificacion: string]: { suma_prestamos: number; situacion_desfavorable: number; numero_identificacion: number; codigo_entidad: string } } = {};
        const entidadesAgrupadas: { [codigoEntidad: string]: { suma_prestamos: number; codigo_entidad: number } } = {};
        let lineCount = 0;
        let errorCount = 0;

        this.logger.log(`Iniciando importación desde ${filePath}`);

        for await (const line of rl) {
            lineCount++;
            const registroRaw = this.parsearLinea(line);
            if (registroRaw) {
                // Procesar para deudores
                const nroIdentificacion = registroRaw.nro_identificacion.trim();
                const situacion = parseInt(registroRaw.situacion.trim(), 10);
                const prestamos = parseFloat(registroRaw.prestamos.trim().replace(',', '.'));

                if (isNaN(situacion) || isNaN(prestamos)) {
                    this.logger.error(`Error de datos en la línea ${lineCount}: Situación o préstamos no son números válidos. Línea: ${line}`);
                    errorCount++;
                    continue;
                }

                if (deudoresAgrupados[nroIdentificacion]) {
                    deudoresAgrupados[nroIdentificacion].suma_prestamos += prestamos;
                    deudoresAgrupados[nroIdentificacion].situacion_desfavorable = Math.max(
                        deudoresAgrupados[nroIdentificacion].situacion_desfavorable,
                        situacion,
                    );
                } else {
                    deudoresAgrupados[nroIdentificacion] = {
                        suma_prestamos: prestamos,
                        situacion_desfavorable: situacion,
                        numero_identificacion: parseInt(nroIdentificacion, 10),
                        codigo_entidad: registroRaw.codigo_entidad.trim(),
                    };
                }

                // Procesar para entidades
                const codigoEntidad = registroRaw.codigo_entidad.trim();
                if (entidadesAgrupadas[codigoEntidad]) {
                    entidadesAgrupadas[codigoEntidad].suma_prestamos += prestamos;
                } else {
                    entidadesAgrupadas[codigoEntidad] = { suma_prestamos: prestamos, codigo_entidad: parseInt(codigoEntidad, 10) };
                }
            } else {
                this.logger.warn(`Línea ${lineCount} vacía o con error de formato, omitida.`);
                errorCount++;
            }
        }
        this.logger.log(`Procesamiento de archivo completado. Líneas procesadas: ${lineCount}, Errores: ${errorCount}`);


        // Guardar en la base de datos deudores
        let deudoresSaved = 0;
        for (const nroIdentificacion in deudoresAgrupados) {
            try {
                await this.deudoresService.saveOrUpdate({
                    _id: nroIdentificacion,
                    situacion_desfavorable: deudoresAgrupados[nroIdentificacion].situacion_desfavorable,
                    suma_prestamos: deudoresAgrupados[nroIdentificacion].suma_prestamos,
                    numero_identificacion: deudoresAgrupados[nroIdentificacion].numero_identificacion,
                    codigo_entidad: deudoresAgrupados[nroIdentificacion].codigo_entidad
                });
                deudoresSaved++;
            } catch (error) {
                this.logger.error(`Error al guardar deudor con _id ${nroIdentificacion}: ${error.message}`, error.stack);
            }
        }
        this.logger.log(`Deudores guardados/actualizados: ${deudoresSaved}`);

        //Guardar en la base de datos entidades
        let entidadesSaved = 0;
        for (const codigoEntidad in entidadesAgrupadas) {
            try {
                await this.entidadesService.saveOrUpdate({
                    _id: codigoEntidad,
                    suma_prestamos: entidadesAgrupadas[codigoEntidad].suma_prestamos,
                    codigo_entidad: entidadesAgrupadas[codigoEntidad].codigo_entidad,
                });
                entidadesSaved++;
            } catch (error) {
                this.logger.error(`Error al guardar entidad con _id ${codigoEntidad}: ${error.message}`, error.stack);
            }
        }
        this.logger.log(`Entidades guardadas/actualizadas: ${entidadesSaved}`);
        this.logger.log('Importación completada.');
    }

    private parsearLinea(line: string): RegistroDeudorRaw | null {
        if (!line.trim()) {
            return null;
        }
        try {
            // Separar la línea por posiciones fijas
            const codigo_entidad = line.substring(0, 5).trim();
            const fecha_informacion = line.substring(5, 11).trim();
            const tipo_identificacion = line.substring(11, 13).trim();
            const nro_identificacion = line.substring(13, 24).trim();
            const actividad = line.substring(24, 27).trim();
            const situacion = line.substring(27, 29).trim();
            const prestamos = line.substring(29, 42).trim();

            // Validaciones adicionales
            if (!codigo_entidad || !fecha_informacion || !tipo_identificacion || !nro_identificacion) {
                return null;
            }

            return {
                codigo_entidad,
                fecha_informacion,
                tipo_identificacion,
                nro_identificacion,
                actividad,
                situacion,
                prestamos,
            };
        } catch (error) {
            this.logger.error(`Error al parsear la línea: ${line}`, error.stack);
            return null;
        }
    }
}

