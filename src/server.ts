import {NestFactory} from '@nestjs/core';
import * as bodyParser from 'body-parser';

import {ApplicationModule} from './app.module';
import {ValidationPipe} from './validation.pipe';
import 'dotenv/config';
import 'reflect-metadata';
import {AppExceptionFilter} from './http-exception.filters';
import * as admin from 'firebase-admin';
import * as OneSignal from 'onesignal-node';


admin.initializeApp({
    credential: admin.credential.cert({
            // @ts-ignore
            type: process.env.type,
            project_id: process.env.project_id,
            private_key_id: process.env.private_key_id,
            // private_key: process.env.private_key,
            private_key:  JSON.parse(process.env.private_key),
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
    } else {
        next();
    }
};

async function bootstrap() {

    const app = await NestFactory.create(ApplicationModule);
    app.use(bodyParser.json());
    app.use(allowCrossDomain);
    // app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new AppExceptionFilter());
    const port = parseInt(process.env.PORT, 10) || 3000;
    await app.listen(port);
}

bootstrap();

// function listAllUsers(nextPageToken?) {
//     // List batch of users, 1000 at a time.
//     admin.auth().listUsers(1, nextPageToken)
//         .then(listUsersResult => {
//             console.log(listUsersResult.users.length);
//
//             listUsersResult.users.forEach(userRecord => {
//                 setTimeout(revokeTokenuid, 1000, userRecord.uid);
//             });
//             if (listUsersResult.pageToken) {
//                 // List next batch of users.
//                 listAllUsers(listUsersResult.pageToken);
//             }
//         })
//         .catch(error => {
//             console.log('Error listing users:', error);
//         });
// }

// Start listing users from the beginning, 1000 at a time.
// listAllUsers();

// function revokeTokenuid(uid) {
//     console.log(uid);
//     admin.auth().revokeRefreshTokens(uid)
//         .then(() => {
//             console.log('revoked');
//         });
// }
// const client = new OneSignal.Client('c9e91d07-f6c6-480b-a9ac-8322418085f8', 'OWM3NDdkMWYtM2JhNC00YjMzLWEwNGMtYzNhOWMwN2QwZTgy');

// function listAllOneSignalUsers() {
//     console.log('start listering onesignalusers');
//
//     client.viewDevices({limit: 4000, offset: 2100}).then(response => {
//         console.log(response.body.players.length);
//         // console.log(response.body.players[0]);
//         response.body.players
//             .forEach(item => {
//                 // console.log(item.tags);
//                 revokeTags(item);
//             });
//     });
// }

// function revokeTags(item) {
//
//     // console.log(item.id);
//     // console.log(item.tags);
//     client.editDevice(item.id, {
//         tags: {laatstIngevuldeTest: null, laatsteVoorspelling: null},
//     }).then(update => {
//         // console.log(update);
//     }).catch(err => {
//         console.log(err);
//     });
// }

// listAllOneSignalUsers();
