import {Module} from '@nestjs/common';

import {DBModule} from '../db/db.module';
import {DeelnemersController} from './deelnemers.controller';
import {DeelnemersService} from './deelnemers.service';
import {deelnemerProviders} from './deelnemer.providers';
import {VoorspellingenModule} from '../voorspellingen/voorspellingen.module';

@Module({
    imports: [DBModule, VoorspellingenModule],
  controllers: [DeelnemersController],
    providers: [
    ...deelnemerProviders,
    DeelnemersService,
  ],
})

export class DeelnemersModule { }
