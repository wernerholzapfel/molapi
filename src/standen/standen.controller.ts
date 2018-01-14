import {Controller, Get, Param, UseInterceptors} from '@nestjs/common';
import {StandenService} from './standen.service';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {CacheInterceptor} from '../cache.interceptor';

@UseInterceptors(CacheInterceptor)
@Controller('standen')
export class StandenController {

    constructor(private readonly standenService: StandenService) {
    }

    @Get()
    async findAll(): Promise<Afleveringpunten[]> {
        const stand = await this.standenService.findAll();

        for (const deelnemer of stand) {
            this.findByDeelnemer(deelnemer.deelnemerId);
        }
        return stand;
    }

    @Get('statistieken')
    async getStatistieken(): Promise<any[]> {
        return this.standenService.getStatistieken();
    }

    @Get(':deelnemerId')
    async findByDeelnemer(@Param('deelnemerId') deelnemerId): Promise<Afleveringpunten[]> {
        return this.standenService.findByDeelnemer(deelnemerId);
    }
}