import {Module} from '@nestjs/common';
import {DBModule} from '../db/db.module';
import {UitnodigingenController} from './uitnodigingen.controller';
import {uitnodigingProviders} from './uitnodiging.providers';
import {UitnodigingenService} from './uitnodigingen.service';
import {VoorspellingenModule} from '../voorspellingen/voorspellingen.module';

@Module({
    imports: [DBModule, VoorspellingenModule],
    controllers: [UitnodigingenController],
    providers: [...uitnodigingProviders, UitnodigingenService],
})

export class UitnodigingenModule {}
