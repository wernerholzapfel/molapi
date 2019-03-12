import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Quizantwoord} from './quizantwoord.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Quizantwoord])],
    controllers: [],
    providers: [],
})

export class QuizvragenModule {
}