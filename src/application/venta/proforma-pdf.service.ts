import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { VentaConDetalle } from '../../domain/venta/venta.entity';

const MARGEN = 30;
const ANCHO_PAGINA = 420; // A5
const ANCHO_CONTENIDO = ANCHO_PAGINA - MARGEN * 2;

@Injectable()
export class ProformaPdfService {
  generar(venta: VentaConDetalle): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A5', margin: MARGEN });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.font('Helvetica-Bold').fontSize(18).text('PROFORMA', MARGEN, MARGEN, { width: ANCHO_CONTENIDO, align: 'center' });
      doc.font('Helvetica').fontSize(9).text(`Venta #${venta.id}`, MARGEN, doc.y, { width: ANCHO_CONTENIDO, align: 'center' });
      doc.moveDown(1);

      doc.fontSize(10);
      this.filaEtiquetaValor(doc, 'Cliente', `${venta.cliente.nombre} ${venta.cliente.apellidoPaterno}`);
      this.filaEtiquetaValor(doc, 'Contacto', venta.cliente.celular || '—');
      this.filaEtiquetaValor(doc, 'Atendido por', `${venta.usuario.nombre} ${venta.usuario.apellidoPaterno}`);
      this.filaEtiquetaValor(doc, 'Sucursal', venta.sucursal.nombre);
      this.filaEtiquetaValor(doc, 'Fecha', venta.fecha.toLocaleString());
      doc.moveDown(0.8);

      const col = { nombre: MARGEN, cantidad: MARGEN + 200, precio: MARGEN + 250, total: MARGEN + 320 };
      const anchoNombre = col.cantidad - col.nombre - 6;
      const anchoTotal = ANCHO_PAGINA - MARGEN - col.total;

      doc.font('Helvetica-Bold').fontSize(9);
      const yEncabezado = doc.y;
      doc.text('Producto', col.nombre, yEncabezado, { width: anchoNombre });
      doc.text('Cant.', col.cantidad, yEncabezado, { width: col.precio - col.cantidad });
      doc.text('Precio', col.precio, yEncabezado, { width: col.total - col.precio });
      doc.text('Total', col.total, yEncabezado, { width: anchoTotal, align: 'right' });
      doc.moveDown(0.3);
      doc
        .moveTo(MARGEN, doc.y)
        .lineTo(ANCHO_PAGINA - MARGEN, doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(9);
      for (const detalle of venta.detalles) {
        const y = doc.y;
        doc.text(detalle.nombreProducto, col.nombre, y, { width: anchoNombre });
        const yTrasNombre = doc.y;
        doc.text(String(detalle.cantidad), col.cantidad, y, { width: col.precio - col.cantidad });
        doc.text(detalle.precioUnitario.toFixed(2), col.precio, y, { width: col.total - col.precio });
        doc.text(detalle.total.toFixed(2), col.total, y, { width: anchoTotal, align: 'right' });
        doc.y = Math.max(doc.y, yTrasNombre);
        doc.moveDown(0.35);
      }

      doc.moveDown(0.3);
      doc
        .moveTo(MARGEN, doc.y)
        .lineTo(ANCHO_PAGINA - MARGEN, doc.y)
        .strokeColor('#cccccc')
        .stroke();
      doc.moveDown(0.5);

      const anchoEtiquetaTotal = 200;
      this.filaTotal(doc, 'Total', `Bs ${Number(venta.total).toFixed(2)}`, anchoEtiquetaTotal, true);
      if (venta.efectivoRecibido !== null) {
        this.filaTotal(doc, 'Efectivo recibido', `Bs ${Number(venta.efectivoRecibido).toFixed(2)}`, anchoEtiquetaTotal, false);
        this.filaTotal(doc, 'Vuelto', `Bs ${Number(venta.vuelto ?? 0).toFixed(2)}`, anchoEtiquetaTotal, false);
      }

      doc.end();
    });
  }

  private filaEtiquetaValor(doc: PDFKit.PDFDocument, etiqueta: string, valor: string) {
    const anchoEtiqueta = 90;
    const y = doc.y;
    doc.font('Helvetica-Bold').text(`${etiqueta}:`, MARGEN, y, { width: anchoEtiqueta, continued: false });
    doc.font('Helvetica').text(valor, MARGEN + anchoEtiqueta, y, { width: ANCHO_CONTENIDO - anchoEtiqueta });
  }

  private filaTotal(doc: PDFKit.PDFDocument, etiqueta: string, valor: string, anchoBloque: number, destacado: boolean) {
    const xEtiqueta = ANCHO_PAGINA - MARGEN - anchoBloque;
    const anchoEtiqueta = anchoBloque * 0.55;
    const y = doc.y;
    doc.font(destacado ? 'Helvetica-Bold' : 'Helvetica').fontSize(destacado ? 11 : 9.5);
    doc.text(etiqueta, xEtiqueta, y, { width: anchoEtiqueta, align: 'left' });
    doc.text(valor, xEtiqueta + anchoEtiqueta, y, { width: anchoBloque - anchoEtiqueta, align: 'right' });
    doc.moveDown(destacado ? 0.6 : 0.4);
  }
}
