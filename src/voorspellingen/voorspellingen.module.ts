import { Module } from '@nestjs/common';

import { DBModule } from '../db/db.module';
import { VoorspellingenController } from './voorspellingen.controller';
import { VoorspellingenService } from './voorspellingen.service';
import { voorspellingProviders } from './voorspelling.providers';

@Module({
    modules: [DBModule],
    controllers: [VoorspellingenController],
    components: [
        ...voorspellingProviders,
        VoorspellingenService,
    ],
    exports: [VoorspellingenService],
})

export class VoorspellingenModule { }
