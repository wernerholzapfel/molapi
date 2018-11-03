import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {VoorspellingenModule} from '../voorspellingen/voorspellingen.module';
import {ActiesController} from './acties.controller';
import {actieProviders} from './actie.providers';
import {ActiesService} from './acties.service';

@Module({
    imports: [DBModule, VoorspellingenModule],
    controllers: [ActiesController],
    providers: [
        ...actieProviders,
        ActiesService,
    ],
})

export class ActiesModule { }
