import {Module} from '@nestjs/common';

import {AfleveringenController} from './afleveringen.controller';
import {AfleveringenService} from './afleveringen.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Aflevering} from './aflevering.entity';
import {CacheService} from '../cache.service';

@Module({
    imports: [TypeOrmModule.forFeature([Aflevering])],
    providers: [AfleveringenService, CacheService],
    controllers: [AfleveringenController],
})

export class AfleveringenModule {
}
