import {Body, Controller, Get, Post} from '@nestjs/common';
import {PoulesService} from './poules.service';
import {CreatePouleDto} from './create-poule.dto';
import {Poule} from './poule.entity';

@Controller('poules')
export class PoulesController {
    constructor(private readonly poulesService: PoulesService) {
    }

    @Get()
    async find(): Promise<Poule[]> {
        return this.poulesService.find();
    }

    @Post('create')
    async create(@Body() createPoulesDto: CreatePouleDto) {
        const newEntry = Object.assign({}, createPoulesDto, {});
        return await this.poulesService.create(newEntry);
    }
}