import {Module} from '@nestjs/common';
import {QuizvragenService} from './quizvragen.service';
import {QuizvragenController} from './quizvragen.controller';
import {Quizvraag} from './quizvraag.entity';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Quizvraag])],
    controllers: [QuizvragenController],
    providers: [
        QuizvragenService,
    ],
})

export class QuizvragenModule {
}