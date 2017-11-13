import { Module } from '@nestjs/common';

import { DBModule } from '../db/db.module';
import {VoorspellingenModule} from '../voorspellingen/voorspellingen.module';
import {AfleveringenController} from './afleveringen.controller';
import {afleveringProviders} from './aflevering.providers';
import {AfleveringenService} from './afleveringen.service';

@Module({
    modules: [DBModule, VoorspellingenModule],
    controllers: [AfleveringenController],
    components: [
        ...afleveringProviders,
        AfleveringenService,
    ],
})

export class AfleveringenModule { }
