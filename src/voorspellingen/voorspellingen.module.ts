import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {VoorspellingenController} from './voorspellingen.controller';
import {VoorspellingenService} from './voorspellingen.service';
import {voorspellingProviders} from './voorspelling.providers';

@Module({
    imports: [DBModule],
    controllers: [VoorspellingenController],
    providers: [
        ...voorspellingProviders,
        VoorspellingenService,
    ],
    exports: [VoorspellingenService],
})

export class VoorspellingenModule { }
