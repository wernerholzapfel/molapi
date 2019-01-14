import {Module} from '@nestjs/common';

import {KandidatenController} from './kandidaten.controller';
import {KandidatenService} from './kandidaten.service';
import {CacheService} from '../cache.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Kandidaat} from './kandidaat.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Kandidaat])],
    providers: [
        KandidatenService,
        CacheService,
    ],
    controllers: [KandidatenController],
})

export class KandidatenModule {
}
