import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizvragenProviders} from './quizvraag.providers';
import {QuizvragenService} from './quizvragen.service';
import {QuizvragenController} from './quizvragen.controller';

@Module({
    modules: [DBModule],
    controllers: [QuizvragenController],
    components: [
        ...quizvragenProviders,
        QuizvragenService,
    ],
})

export class QuizvragenModule {}