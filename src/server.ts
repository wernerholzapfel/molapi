import * as newrelic from 'newrelic';
import {NestFactory} from '@nestjs/core';
import * as bodyParser from 'body-parser';

import {ApplicationModule} from './app.module';
import {ValidationPipe} from './validation.pipe';
import 'dotenv/config';
import 'reflect-metadata';
import {AppExceptionFilter} from './http-exception.filters';
import * as admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert({
            // @ts-ignore
            type: process.env.type,
            project_id: process.env.project_id,
            private_key_id: process.env.private_key_id,
            private_key: process.env.private_key,
            // private_key:  JSON.parse(process.env.private_key),
            client_email: process.env.client_email,
            client_id: process.env.client_id,
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://accounts.google.com/o/oauth2/token',
            auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
            client_x509_cert_url: process.env.client_x509_cert_url,
        },
    ),
    databaseURL: process.env.firebaseDatabaseUrl,
});

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Pragma, Cache-Control, Expires');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.sendStatus(200);
    }
    else {
        next();
    }
};

async function bootstrap() {

    const app = await NestFactory.create(ApplicationModule);
    app.use(bodyParser.json());
    app.use(allowCrossDomain);
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AppExceptionFilter());
    const port = parseInt(process.env.PORT, 10) || 3000;
    await app.listen(port);
}

bootstrap();
