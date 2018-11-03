import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {KandidatenController} from './kandidaten.controller';
import {KandidatenService} from './kandidaten.service';
import {kandidaatProviders} from './kandidaat.providers';
import {CacheService} from '../cache.service';

@Module({
    imports: [DBModule],
    controllers: [KandidatenController],
    providers: [
        ...kandidaatProviders,
        KandidatenService,
        CacheService,
    ],
})

export class KandidatenModule {
}
