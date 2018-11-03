import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {quizantwoordenProviders} from './quizantwoord.providers';

@Module({
    imports: [DBModule],
    controllers: [],
    providers: [
        ...quizantwoordenProviders,
    ],
})

export class QuizvragenModule {}