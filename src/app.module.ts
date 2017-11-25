import {Module, NestModule, RequestMethod} from '@nestjs/common';

import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {
    AdminMiddleware, AuthenticationMiddleware, IsEmailVerifiedMiddleware,
    IsUserAllowedToPostMiddleware
} from './authentication.middleware';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import {AfleveringenModule} from './afleveringen/afleveringen.module';
import {KandidatenModule} from './kandidaten/kandidaten.module';
import {StandenModule} from './standen/standen.module';
import {QuizvragenModule} from './quizvragen/quizvragen.module';
import {QuizresultatenModule} from './quizresultaten/quizresultaten.module';
import {QuizpuntenModule} from './quizpunten/quizpunten.module';
import {QuizMiddleware} from './quiz.middleware';

@Module({
    modules: [QuizpuntenModule, QuizresultatenModule, QuizvragenModule, VoorspellingenModule, StandenModule, DeelnemersModule, KandidatenModule, AfleveringenModule],
})

export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(AuthenticationMiddleware).forRoutes(
            {path: '/**', method: RequestMethod.POST},
            {path: '/deelnemers/loggedIn', method: RequestMethod.GET},
            {path: '/quizvragen', method: RequestMethod.GET},
        );
        consumer.apply(IsEmailVerifiedMiddleware).forRoutes(
            {path: '/**', method: RequestMethod.POST},
            {path: 'deelnemers/loggedIn', method: RequestMethod.GET},
            {path: '/quizvragen', method: RequestMethod.GET},
            {path: '/quizresultaten', method: RequestMethod.GET},
        );
        consumer.apply(AdminMiddleware).forRoutes(
            {path: '/kandidaten', method: RequestMethod.POST},
                {path: '/afleveringen', method: RequestMethod.POST},
                {path: '/quizvragen', method: RequestMethod.POST},
        );
        consumer.apply(QuizMiddleware).forRoutes(
            {path: '/quizresultaten', method: RequestMethod.POST},
        );
        consumer.apply(IsUserAllowedToPostMiddleware).forRoutes(
            {path: '/quizresultaten', method: RequestMethod.POST},
            {path: '/voorspellingen', method: RequestMethod.POST},
        );
    }
}