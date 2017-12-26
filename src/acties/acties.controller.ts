import {Controller, Get} from '@nestjs/common';
import {Actie} from './actie.entity';
import {ActiesService} from './acties.service';

@Controller('acties')
export class ActiesController {
    constructor(private readonly actiesService: ActiesService) {
    }

    @Get()
    async find(): Promise<Actie> {
        return this.actiesService.find();
    }
}