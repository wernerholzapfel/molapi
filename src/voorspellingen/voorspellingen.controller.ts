import {Body, Controller, Get, HttpStatus, Logger, Post, Res} from '@nestjs/common';

import {CreateVoorspellingDto} from './create-voorspelling.dto';
import {VoorspellingenService} from './voorspellingen.service';
import {Voorspelling} from './voorspelling.entity';

@Controller('voorspellingen')
export class VoorspellingenController {
    private readonly logger = new Logger('voorspellingenController', true);

    constructor(private readonly voorspellingenService: VoorspellingenService) {
    }

    @Get()
    async findAll(): Promise<Voorspelling[]> {
        return this.voorspellingenService.findAll();
    }

    @Post()
    async create(@Res() res, @Body() createVoorspellingDto: CreateVoorspellingDto) {
        const newVoorspelling = Object.assign({}, createVoorspellingDto, {
            created_at: new Date(),
        });
        await this.voorspellingenService.create(newVoorspelling, res);
    }

// @Delete(':voorspellingId')
// delete( @Param('voorspellingId') voorspellingId) {
//   return this.voorspellingenService.deleteOne(voorspellingId);
// }
}
