import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {PoulesController} from './poules.controller';
import {pouleProviders} from './poule.providers';
import {PoulesService} from './poules.service';

@Module({
    imports: [DBModule],
    controllers: [PoulesController],
    providers: [
        ...pouleProviders,
        PoulesService,
    ],
})

export class PoulesModule { }
