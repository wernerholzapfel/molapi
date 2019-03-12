import {Module} from '@nestjs/common';
import {ActiesController} from './acties.controller';
import {ActiesService} from './acties.service';
import {Actie} from './actie.entity';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Actie])],
    providers: [ActiesService],
    controllers: [ActiesController],
})

export class ActiesModule {
}
