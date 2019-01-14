import {Module} from '@nestjs/common';
import {UitnodigingenController} from './uitnodigingen.controller';
import {UitnodigingenService} from './uitnodigingen.service';
import {Uitnodiging} from './uitnodiging.entity';
import {TypeOrmModule} from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Uitnodiging])],
    controllers: [UitnodigingenController],
    providers: [UitnodigingenService],
})

export class UitnodigingenModule {
}
