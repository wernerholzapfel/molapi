import {Controller, Get} from '@nestjs/common';
import {ActiesService} from './acties.service';
import {ActieResponse} from './actieresponse.interface';

@Controller('acties')
export class ActiesController {
    constructor(private readonly actiesService: ActiesService) {
    }

    @Get()
    async find(): Promise<ActieResponse> {
        return this.actiesService.find();
    }
}