import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import * as slug from 'slug';

import { Mol } from './mol.entity';
import { CreatemolDto } from './create-mol.dto';
import { MollenService } from './mollen.service';

@Controller('mollen')
export class MollenController {

  constructor(
    private readonly mollenService: MollenService,
  ) { }

  @Get()
  async findAll(): Promise<Mol[]> {
    return this.mollenService.findAll();
  }

  @Post()
  async create( @Body() createmolDto: CreatemolDto) {
    const newEntry = Object.assign({}, createmolDto, {
    });
    await this.mollenService.create(newEntry);
  }

  @Delete(':molId')
  delete( @Param('molId') molId) {
    return this.mollenService.deleteOne(molId);
  }
  //
  // @Get(':molId/entries')
  // findEntriesByCategory( @Param('molId') molId): Promise<Entry[]> {
  //   return this.entriesService.findEntriesBymol(molId);
  // }

}
