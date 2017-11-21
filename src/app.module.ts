import {Module, NestModule, RequestMethod} from '@nestjs/common';

import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {AdminMiddleware, AuthenticationMiddleware, IsEmailVerifiedMiddleware} from './authentication.middleware';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import {AfleveringenModule} from './afleveringen/afleveringen.module';
import {KandidatenModule} from './kandidaten/kandidaten.module';
import {StandenModule} from './standen/standen.module';
import {QuizvragenModule} from './quizvragen/quizvragen.module';
import {QuizresultatenModule} from './quizresultaten/quizresultaten.module';
import {QuizpuntenModule} from './quizpunten/quizpunten.module';

@Module({
    modules: [QuizpuntenModule, QuizresultatenModule, QuizvragenModule, VoorspellingenModule, StandenModule, DeelnemersModule, KandidatenModule, AfleveringenModule],
})

export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(AuthenticationMiddleware).forRoutes(
            {path: '/**', method: RequestMethod.POST},
        );
        // consumer.apply(IsEmailVerifiedMiddleware).forRoutes(
        //     {path: '/**', method: RequestMethod.POST},
        // );
        // consumer.apply(AdminMiddleware).forRoutes(
        //     {path: '/kandidaten', method: RequestMethod.POST},
        //         {path: '/afleveringen', method: RequestMethod.POST},
        //         {path: '/quizvragen', method: RequestMethod.POST},
        // );
    }
}