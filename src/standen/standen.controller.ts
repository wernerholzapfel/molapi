import {Controller, Get, Param, UseInterceptors} from '@nestjs/common';
import {StandenService} from './standen.service';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {CacheInterceptor} from '../cache.interceptor';
import {Stand} from './standen.interface';

@UseInterceptors(CacheInterceptor)
@Controller('standen')
export class StandenController {

    constructor(private readonly standenService: StandenService) {
    }

    @Get()
    async findAll(): Promise<Stand[]> {
        return this.standenService.findAll();
    }

    @Get('aflevering/:aflevering')
    async getStandByAflevering(@Param('aflevering') aflevering): Promise<Stand[]> {
        return this.standenService.getStandByAflevering(aflevering);
    }

    @Get('getpossiblestand/:molId/:winnaarId')
    async getpossiblestand(@Param('molId') molId, @Param('winnaarId') winnaarId): Promise<any[]> {
        return this.standenService.getPossibleStand(molId, winnaarId);
    }

    @Get('statistieken')
    async getStatistieken(): Promise<any[]> {
        return this.standenService.getStatistieken();
    }

    @Get('deelnemer/:deelnemerId')
    async findByDeelnemer(@Param('deelnemerId') deelnemerId): Promise<Afleveringpunten[]> {
        return this.standenService.findByDeelnemer(deelnemerId);
    }

    @Get('deelnemer/:deelnemerId/aflevering/:aflevering')
    async findByDeelnemerAndAflevering(@Param('deelnemerId') deelnemerId, @Param('aflevering') aflevering): Promise<Afleveringpunten[]> {
        return this.standenService.findByDeelnemerAndAflevering(deelnemerId, aflevering);
    }
}