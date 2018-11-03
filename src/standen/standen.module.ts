import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {StandenController} from './standen.controller';
import {StandenService} from './standen.service';
import {afleveringPuntProviders} from '../afleveringpunten/afleveringpunt.providers';
import {CacheService} from '../cache.service';

@Module({
    imports: [DBModule],
    controllers: [StandenController],
    providers: [
        ...afleveringPuntProviders,
        StandenService,
        CacheService,
    ],
})

export class StandenModule {
}
