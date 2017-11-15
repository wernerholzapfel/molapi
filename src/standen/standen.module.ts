import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {StandenController} from './standen.controller';
import {StandenService} from './standen.service';
import {afleveringPuntProviders} from '../afleveringpunten/afleveringpunt.providers';

@Module({
    modules: [DBModule],
    controllers: [StandenController],
    components: [
        ...afleveringPuntProviders,
        StandenService,
    ],
})

export class StandenModule {
}
