import {Body, Controller, Get, Post} from '@nestjs/common';
import {ActiesService} from './acties.service';
import {ActieResponse} from './actieresponse.interface';
import {CreateActiesDto} from './create-actie.dto';

@Controller('acties')
export class ActiesController {
    constructor(private readonly actiesService: ActiesService) {
    }

    @Get()
    async find(): Promise<ActieResponse> {
        return this.actiesService.find();
    }

    @Post()
    async create(@Body() createActiesDto: CreateActiesDto) {
        const newEntry = Object.assign({}, createActiesDto, {});
        return await this.actiesService.create(newEntry);
    }
}