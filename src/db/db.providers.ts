import {createConnection} from 'typeorm';

import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {Quizvraag} from '../quizvragen/quizvraag.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';
import {Quizpunt} from '../quizpunten/quizpunt.entity';
import {Actie} from '../acties/actie.entity';
import {Poule} from '../poules/poule.entity';
import {Uitnodiging} from '../uitnodigingen/uitnodiging.entity';

export const dbProvider =
    {
        provide: 'DbConnectionToken',
        useFactory: async () => await createConnection({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: process.env.DB_SSL,
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
            synchronize: true, // DEV only, do not use on PROD!
        }),
    };
