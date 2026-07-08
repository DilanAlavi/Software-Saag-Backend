import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductoService } from '../../../application/producto/producto.service';
import { ImportacionProductoService } from '../../../application/producto/importacion-producto.service';
import { CrearProductoDto } from '../../../application/producto/dto/crear-producto.dto';
import { ActualizarProductoDto } from '../../../application/producto/dto/actualizar-producto.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('productos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly importacionProductoService: ImportacionProductoService,
  ) {}

  @Get()
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  listar(@Query('search') search?: string, @Query('tipoProducto') tipoProducto?: string) {
    return this.productoService.listar({ search, tipoProducto });
  }

  @Get('marcas')
  @Roles('ADMIN', 'ADMIN_SUCURSAL', 'VENDEDOR')
  marcas() {
    return this.productoService.marcas();
  }

  @Get('plantilla')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  plantilla(@Res() res: any) {
    const buffer = this.importacionProductoService.generarPlantilla();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla_productos.xlsx"',
    });
    res.send(buffer);
  }

  @Post('importar')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  @UseInterceptors(FileInterceptor('archivo'))
  importar(@Req() req: any, @UploadedFile() archivo: any) {
    if (!archivo) {
      throw new BadRequestException('No se envió ningún archivo');
    }
    if (!/\.xlsx$/i.test(archivo.originalname)) {
      throw new BadRequestException('Solo se aceptan archivos .xlsx');
    }
    return this.importacionProductoService.importar(archivo.buffer, req.user.sub);
  }

  @Post()
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  crear(@Req() req: any, @Body() dto: CrearProductoDto) {
    return this.productoService.crear(req.user.sub, dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProductoDto) {
    return this.productoService.actualizar(Number(id), dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  eliminar(@Req() req: any, @Param('id') id: string) {
    return this.productoService.eliminar(req.user.sub, Number(id));
  }

  @Get(':id/historial')
  @Roles('ADMIN', 'ADMIN_SUCURSAL')
  historial(@Param('id') id: string) {
    return this.productoService.historial(Number(id));
  }
}
