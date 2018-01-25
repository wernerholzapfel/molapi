import {Module, NestModule, RequestMethod} from '@nestjs/common';

import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {
    AddAuth0UserToRequest,
    AdminMiddleware,
    AuthenticationMiddleware,
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
import {ActiesModule} from './acties/acties.module';
import {VoorspellingMiddleware} from './voorspelling.middleware';

@Module({
    modules: [ActiesModule, QuizpuntenModule, QuizresultatenModule, QuizvragenModule, VoorspellingenModule, StandenModule, DeelnemersModule, KandidatenModule, AfleveringenModule],
})

export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(AuthenticationMiddleware).forRoutes(
            {path: '/**', method: RequestMethod.POST},
            {path: '/deelnemers/loggedIn', method: RequestMethod.GET},
            {path: '/deelnemers/voorspellingen', method: RequestMethod.GET},
            {path: '/quizvragen', method: RequestMethod.GET},
            {path: '/quizresultaten', method: RequestMethod.GET},
            {path: '/quizpunten/**', method: RequestMethod.GET},
            {path: '/quizvragen/aflevering/**', method: RequestMethod.GET},
        );
        consumer.apply(AddAuth0UserToRequest).forRoutes(
            {path: '/**', method: RequestMethod.POST},
            {path: 'deelnemers/loggedIn', method: RequestMethod.GET},
            {path: 'deelnemers/voorspellingen', method: RequestMethod.GET},
            {path: '/quizvragen', method: RequestMethod.GET},
            {path: '/quizresultaten', method: RequestMethod.GET},
            {path: '/quizpunten/**', method: RequestMethod.GET},
        );
        consumer.apply(AdminMiddleware).forRoutes(
            {path: '/acties', method: RequestMethod.POST},
            {path: '/acties', method: RequestMethod.GET},
            {path: '/afleveringen', method: RequestMethod.POST},
            {path: '/kandidaten', method: RequestMethod.POST},
            {path: '/quizvragen', method: RequestMethod.POST},
            {path: '/quizvragen/update', method: RequestMethod.POST},
            {path: '/quizvragen/aflevering/**', method: RequestMethod.GET},
        );
        consumer.apply(IsUserAllowedToPostMiddleware).forRoutes(
            {path: '/quizresultaten', method: RequestMethod.POST},
            {path: '/voorspellingen', method: RequestMethod.POST},
        );
        consumer.apply(QuizMiddleware).forRoutes(
            {path: '/quizresultaten', method: RequestMethod.POST},
        );
        consumer.apply(VoorspellingMiddleware).forRoutes(
            {path: '/voorspellingen', method: RequestMethod.POST},
        );
    }
}