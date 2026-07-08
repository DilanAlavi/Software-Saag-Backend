import { Inject, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { PRODUCTO_REPOSITORY, ProductoRepository } from '../../domain/producto/producto.repository';
import { PRECIO_REPOSITORY, PrecioRepository } from '../../domain/precio/precio.repository';

const TIPOS_VALIDOS = ['CARPINTERIA', 'FERRETERIA', 'PLOMERIA', 'ELECTRICO'];

const ENCABEZADOS = [
  'Nombre',
  'Nombres alternativos',
  'Marca',
  'Tipo',
  'Codigo',
  'Precio Base',
  'Standard 1',
  'Standard 2',
  'Mayor 1',
  'Mayor 2',
  'Plomeria',
  'Carpinteria',
  'Electricista',
  'Precio Caja',
  'Cantidad minima descuento Standard 1',
  'Precio descuento Standard 1',
];

export interface ErrorImportacion {
  fila: number;
  mensaje: string;
}

@Injectable()
export class ImportacionProductoService {
  constructor(
    @Inject(PRODUCTO_REPOSITORY) private readonly productoRepository: ProductoRepository,
    @Inject(PRECIO_REPOSITORY) private readonly precioRepository: PrecioRepository,
  ) {}

  generarPlantilla(): Buffer {
    const ejemplo = [
      'Martillo de bola 16oz',
      'martillo carpintero, martillo bola',
      'Truper',
      'FERRETERIA',
      '7506005923456',
      45.5,
      65,
      60,
      55,
      52,
      58,
      58,
      58,
      50,
      10,
      62,
    ];
    const hoja = XLSX.utils.aoa_to_sheet([ENCABEZADOS, ejemplo]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Productos');
    return XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  async importar(buffer: Buffer, realizadoPorId: number) {
    const libro = XLSX.read(buffer, { type: 'buffer' });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    const filas: any[] = XLSX.utils.sheet_to_json(hoja, { defval: '' });

    let creados = 0;
    const errores: ErrorImportacion[] = [];

    for (let i = 0; i < filas.length; i++) {
      const numeroFila = i + 2;
      try {
        const datos = this.validarFila(filas[i]);
        const producto = await this.productoRepository.crearConHistorial(
          {
            nombre: datos.nombre,
            nombresAlternativos: datos.nombresAlternativos,
            marca: datos.marca,
            tipoProducto: datos.tipoProducto,
            codigo: datos.codigo,
          },
          realizadoPorId,
        );
        await this.precioRepository.guardar(producto.id, datos.precios);
        creados++;
      } catch (e: any) {
        errores.push({ fila: numeroFila, mensaje: e.message ?? 'Error desconocido' });
      }
    }

    return { creados, errores };
  }

  private validarFila(fila: any) {
    const nombre = String(fila['Nombre'] ?? '').trim();
    if (!nombre) throw new Error('Falta el nombre');

    const tipoProducto = String(fila['Tipo'] ?? '').trim().toUpperCase();
    if (!TIPOS_VALIDOS.includes(tipoProducto)) {
      throw new Error(`Tipo inválido: "${tipoProducto}" (debe ser CARPINTERIA, FERRETERIA, PLOMERIA o ELECTRICO)`);
    }

    const marca = String(fila['Marca'] ?? '').trim() || undefined;
    const codigo = String(fila['Codigo'] ?? '').trim() || undefined;
    const nombresAlternativos = String(fila['Nombres alternativos'] ?? '')
      .split(',')
      .map((n: string) => n.trim())
      .filter(Boolean);

    const numero = (campo: string): number => {
      const crudo = fila[campo];
      const valor = Number(crudo);
      if (crudo === '' || crudo === undefined || isNaN(valor)) {
        throw new Error(`Falta o es inválido el campo "${campo}"`);
      }
      return valor;
    };

    const precioCosto = numero('Precio Base');
    const menor1 = numero('Standard 1');
    const menor2 = numero('Standard 2');
    const mayor1 = numero('Mayor 1');
    const mayor2 = numero('Mayor 2');
    const plomeria = numero('Plomeria');
    const carpinteria = numero('Carpinteria');
    const electricista = numero('Electricista');

    const pares: [string, number][] = [
      ['Standard 1', menor1],
      ['Standard 2', menor2],
      ['Mayor 1', mayor1],
      ['Mayor 2', mayor2],
      ['Plomeria', plomeria],
      ['Carpinteria', carpinteria],
      ['Electricista', electricista],
    ];
    for (const [etiqueta, valor] of pares) {
      if (valor <= precioCosto) {
        throw new Error(`El precio "${etiqueta}" (${valor}) debe ser mayor al Precio Base (${precioCosto})`);
      }
    }

    const precioCajaRaw = fila['Precio Caja'];
    const precioCaja = precioCajaRaw !== '' && precioCajaRaw !== undefined ? Number(precioCajaRaw) : undefined;
    if (precioCaja !== undefined && (isNaN(precioCaja) || precioCaja <= precioCosto)) {
      throw new Error(`El precio de Caja debe ser mayor al Precio Base (${precioCosto})`);
    }

    const cantidadMinimaRaw = fila['Cantidad minima descuento Standard 1'];
    const precioDescuentoRaw = fila['Precio descuento Standard 1'];
    const cantidadMinimaDescuentoMenor1 =
      cantidadMinimaRaw !== '' && cantidadMinimaRaw !== undefined ? Number(cantidadMinimaRaw) : undefined;
    const precioDescuentoMenor1 =
      precioDescuentoRaw !== '' && precioDescuentoRaw !== undefined ? Number(precioDescuentoRaw) : undefined;

    if (precioDescuentoMenor1 !== undefined) {
      if (cantidadMinimaDescuentoMenor1 === undefined) {
        throw new Error('Falta la cantidad mínima para el descuento de Standard 1');
      }
      if (precioDescuentoMenor1 >= menor1) {
        throw new Error(`El precio con descuento (${precioDescuentoMenor1}) debe ser menor a Standard 1 (${menor1})`);
      }
    }

    return {
      nombre,
      marca,
      codigo,
      tipoProducto,
      nombresAlternativos,
      precios: {
        precioCosto,
        menor1,
        menor2,
        mayor1,
        mayor2,
        plomeria,
        carpinteria,
        electricista,
        precioCaja,
        cantidadMinimaDescuentoMenor1,
        precioDescuentoMenor1,
      },
    };
  }
}
