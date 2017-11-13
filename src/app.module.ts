import {Module, NestModule, RequestMethod} from '@nestjs/common';

import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {CategoriesModule} from './categories/categories.module';
import {AuthenticationMiddleware} from './authentication.middleware';
import {MiddlewaresConsumer} from '@nestjs/common/interfaces/middlewares';
import {AfleveringenModule} from './afleveringen/afleveringen.module';
import {KandidatenModule} from './kandidaten/kandidaten.module';

@Module({
    modules: [VoorspellingenModule, DeelnemersModule, CategoriesModule, KandidatenModule, AfleveringenModule],
})

export class ApplicationModule implements NestModule {
    configure(consumer: MiddlewaresConsumer): void {
        consumer.apply(AuthenticationMiddleware).forRoutes(
            { path: '/**', method: RequestMethod.POST },
        );
    }
}