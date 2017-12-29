import { Module } from '@nestjs/common';

import { DBModule } from '../db/db.module';
import {VoorspellingenModule} from '../voorspellingen/voorspellingen.module';
import {AfleveringenController} from './afleveringen.controller';
import {afleveringProviders} from './aflevering.providers';
import {AfleveringenService} from './afleveringen.service';
import {CacheService} from '../cache.service';

@Module({
    modules: [DBModule, VoorspellingenModule],
    controllers: [AfleveringenController],
    components: [
        ...afleveringProviders,
        AfleveringenService,
        CacheService,
    ],
})

export class AfleveringenModule { }
