import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {StandenController} from './standen.controller';
import {StandenService} from './standen.service';
import {afleveringPuntProviders} from '../afleveringpunten/afleveringpunt.providers';
import {CacheService} from '../cache.service';

@Module({
    modules: [DBModule],
    controllers: [StandenController],
    components: [
        ...afleveringPuntProviders,
        StandenService,
        CacheService,
    ],
})

export class StandenModule {
}
