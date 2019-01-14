import {Module} from '@nestjs/common';

import {VoorspellingenController} from './voorspellingen.controller';
import {VoorspellingenService} from './voorspellingen.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Voorspelling} from './voorspelling.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Voorspelling])],
    controllers: [VoorspellingenController],
    providers: [
        VoorspellingenService,
    ],
    exports: [VoorspellingenService],
})

export class VoorspellingenModule {
}
