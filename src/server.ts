import {NestFactory} from '@nestjs/core';
import * as bodyParser from 'body-parser';

import * as express from 'express';
import {ApplicationModule} from './app.module';
import {ValidationPipe} from './validation.pipe';
import 'dotenv/config';
import 'reflect-metadata';
import {AppExceptionFilter} from './http-exception.filters';

let allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

async function bootstrap() {

    const app = await NestFactory.create(ApplicationModule);
    app.use(bodyParser.json());
    app.use(allowCrossDomain);
    app.use(express.static(__dirname + '/public'));
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AppExceptionFilter());
    const port = parseInt(process.env.PORT, 10) || 3000;
    await app.listen(port);
}

bootstrap();
