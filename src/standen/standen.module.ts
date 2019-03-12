import {Module} from '@nestjs/common';

import {StandenController} from './standen.controller';
import {StandenService} from './standen.service';
import {CacheService} from '../cache.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Afleveringpunten])], // todo delete?
    controllers: [StandenController],
    providers: [
        StandenService,
        CacheService,
    ],
})

export class StandenModule {
}
