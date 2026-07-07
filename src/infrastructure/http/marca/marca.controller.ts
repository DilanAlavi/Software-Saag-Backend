import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MarcaService } from '../../../application/marca/marca.service';
import { CrearMarcaDto } from '../../../application/marca/dto/crear-marca.dto';
import { JwtAuthGuard } from '../../security/jwt-auth.guard';
import { RolesGuard } from '../../security/roles.guard';
import { Roles } from '../../security/roles.decorator';

@Controller('marcas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ADMIN_SUCURSAL')
export class MarcaController {
  constructor(private readonly marcaService: MarcaService) {}

  @Get()
  listar() {
    return this.marcaService.listar();
  }

  @Post()
  crear(@Body() dto: CrearMarcaDto) {
    return this.marcaService.crear(dto.nombre);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.marcaService.eliminar(Number(id));
  }
}
