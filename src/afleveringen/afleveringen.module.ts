import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {VoorspellingenModule} from '../voorspellingen/voorspellingen.module';
import {AfleveringenController} from './afleveringen.controller';
import {afleveringProviders} from './aflevering.providers';
import {AfleveringenService} from './afleveringen.service';
import {CacheService} from '../cache.service';

@Module({
    imports: [DBModule, VoorspellingenModule],
    controllers: [AfleveringenController],
    providers: [
        ...afleveringProviders,
        AfleveringenService,
        CacheService,
    ],
})

export class AfleveringenModule { }
