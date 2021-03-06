import {Logger, Module, NestModule, RequestMethod} from '@nestjs/common';
import {VoorspellingenModule} from './voorspellingen/voorspellingen.module';
import {DeelnemersModule} from './deelnemers/deelnemers.module';
import {AddFireBaseUserToRequest, AdminMiddleware, IsUserAllowedToPostMiddleware} from './authentication.middleware';
import {AfleveringenModule} from './afleveringen/afleveringen.module';
import {KandidatenModule} from './kandidaten/kandidaten.module';
import {StandenModule} from './standen/standen.module';
import {QuizvragenModule} from './quizvragen/quizvragen.module';
import {QuizresultatenModule} from './quizresultaten/quizresultaten.module';
import {QuizpuntenModule} from './quizpunten/quizpunten.module';
import {QuizMiddleware} from './quiz.middleware';
import {ActiesModule} from './acties/acties.module';
import {VoorspellingMiddleware} from './voorspelling.middleware';
import {MiddlewareConsumer} from '@nestjs/common/interfaces/middleware';
import {PoulesModule} from './poules/poules.module';
import {UitnodigingenModule} from './uitnodigingen/uitnodigingen.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Voorspelling} from './voorspellingen/voorspelling.entity';
import {Deelnemer} from './deelnemers/deelnemer.entity';
import {Kandidaat} from './kandidaten/kandidaat.entity';
import {Afleveringpunten} from './afleveringpunten/afleveringpunt.entity';
import {Aflevering} from './afleveringen/aflevering.entity';
import {Quizvraag} from './quizvragen/quizvraag.entity';
import {Quizantwoord} from './quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from './quizresultaten/quizresultaat.entity';
import {Quizpunt} from './quizpunten/quizpunt.entity';
import {Actie} from './acties/actie.entity';
import {Poule} from './poules/poule.entity';
import {Uitnodiging} from './uitnodigingen/uitnodiging.entity';

@Module({
    imports: [TypeOrmModule.forRoot({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: true,
        entities: [
            Voorspelling,
            Deelnemer,
            Kandidaat,
            Afleveringpunten,
            Aflevering,
            Quizvraag,
            Quizantwoord,
            Quizresultaat,
            Quizpunt,
            Actie,
            Poule,
            Uitnodiging,
        ],
        logging: false,
        synchronize: false, // DEV only, do not use on PROD!
    }) , ActiesModule, QuizpuntenModule, QuizresultatenModule, QuizvragenModule, VoorspellingenModule, StandenModule, DeelnemersModule, KandidatenModule, AfleveringenModule, PoulesModule, UitnodigingenModule],
})

export class ApplicationModule implements NestModule {
    private readonly logger = new Logger('AppModule', true);

    configure(consumer: MiddlewareConsumer): void {
        // consumer.apply(AuthenticationMiddleware).forRoutes(
        //     {path: '/**', method: RequestMethod.POST},
        //     {path: '/deelnemers/loggedIn', method: RequestMethod.GET},
        //     {path: '/deelnemers/voorspellingen', method: RequestMethod.GET},
        //     {path: '/quizvragen', method: RequestMethod.GET},
        //     {path: '/quizresultaten', method: RequestMethod.GET},
        //     {path: '/quizpunten/**', method: RequestMethod.GET},
        //     {path: '/quizvragen/aflevering/**', method: RequestMethod.GET},
        // );
        consumer.apply(AddFireBaseUserToRequest).forRoutes(
            {path: '/**', method: RequestMethod.POST},
            {path: 'deelnemers/loggedIn', method: RequestMethod.GET},
            {path: 'deelnemers/tests', method: RequestMethod.GET},
            {path: 'deelnemers/voorspellingen', method: RequestMethod.GET},
            {path: '/deelnemers/actualvoorspelling', method: RequestMethod.GET},
            {path: '/quizvragen', method: RequestMethod.GET},
            {path: '/quizvragen/aantalopenvragen', method: RequestMethod.GET},
            {path: '/quizresultaten', method: RequestMethod.GET},
            {path: '/quizpunten/**', method: RequestMethod.GET},
            {path: '/uitnodigingen', method: RequestMethod.GET},
            {path: '/uitnodigingen/**', method: RequestMethod.GET},
            {path: '/voorspellingen/huidig', method: RequestMethod.GET},
        );
        consumer.apply(AdminMiddleware).forRoutes(
            {path: '/acties', method: RequestMethod.POST},
            {path: '/afleveringen', method: RequestMethod.POST},
            {path: '/kandidaten', method: RequestMethod.POST},
            {path: '/quizvragen', method: RequestMethod.POST},
            {path: '/quizvragen/update', method: RequestMethod.POST},
            // {path: '/quizvragen/aflevering/**', method: RequestMethod.GET}, // dubbel
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
        // middleware toevoegen dat create uitnodigingen checkt
        // middleware toevoegen dat accept uitnodigingen checkt

        // admin.auth().setCustomUserClaims('YJQKN3IjdqPyNGtLuARrxtqq0If1', {admin: true}).then(() => {
        //     this.logger.log('customerset');
        // });
    }
}
