import {createConnection} from 'typeorm';

import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Deelnemer} from '../deelnemers/deelnemer.entity';
import {Category} from '../categories/category.entity';
import {Afleveringpunten} from '../afleveringpunten/afleveringpunt.entity';
import {Aflevering} from '../afleveringen/aflevering.entity';
import {Kandidaat} from '../kandidaten/kandidaat.entity';
import {Quizvraag} from '../quizvragen/quizvraag.entity';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';

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
                Category,
                Kandidaat,
                Afleveringpunten,
                Aflevering,
                Quizvraag,
                Quizantwoord,
                Quizresultaat,
            ],
            logging: true,
            synchronize: true, // DEV only, do not use on PROD!
        }),
    };
