import {Module} from '@nestjs/common';
import {PoulesController} from './poules.controller';
import {PoulesService} from './poules.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Poule} from './poule.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Poule])],
    controllers: [PoulesController],
    providers: [
        PoulesService,
    ],
})

export class PoulesModule {
}
