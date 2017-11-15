import {Controller, Get, Param} from '@nestjs/common';
import {StandenService} from './standen.service';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';

@Controller('standen')
export class StandenController {

    constructor(private readonly standenService: StandenService) {
    }

    @Get()
    async findAll(): Promise<Afleveringpunten[]> {
        return this.standenService.findAll();
    }

    @Get(':deelnemerId')
    async findByDeelnemer(@Param('deelnemerId') deelnemerId): Promise<Afleveringpunten[]> {
        return this.standenService.findByDeelnemer(deelnemerId);
    }
}