import {Module, NestModule, RequestMethod} from '@nestjs/common';

import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {CategoriesModule} from './categories/categories.module';
import {AdminMiddleware, AuthenticationMiddleware} from './authentication.middleware';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import {AfleveringenModule} from './afleveringen/afleveringen.module';
import {KandidatenModule} from './kandidaten/kandidaten.module';
import {StandenModule} from './standen/standen.module';
import {QuizvragenModule} from './quizvragen/quizvragen.module';
import {QuizresultatenModule} from './quizresultaten/quizresultaten.module';

@Module({
    modules: [QuizresultatenModule, QuizvragenModule, VoorspellingenModule, StandenModule, DeelnemersModule, CategoriesModule, KandidatenModule, AfleveringenModule],
})

export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(AuthenticationMiddleware).forRoutes(
            { path: '/**', method: RequestMethod.POST },
        );
        consumer.apply(AdminMiddleware).forRoutes(
            { path: '/kandidaten', method: RequestMethod.POST },
        );
    }
}