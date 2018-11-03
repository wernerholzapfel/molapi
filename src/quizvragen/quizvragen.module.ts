import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizvragenProviders} from './quizvraag.providers';
import {QuizvragenService} from './quizvragen.service';
import {QuizvragenController} from './quizvragen.controller';

@Module({
    imports: [DBModule],
    controllers: [QuizvragenController],
    providers: [
        ...quizvragenProviders,
        QuizvragenService,
    ],
})

export class QuizvragenModule {}