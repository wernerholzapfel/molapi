// import {Body, Controller, Get, Logger, Param, Post, Req} from '@nestjs/common';
//
// import {ManagementClient} from 'auth0';
// import * as _ from 'lodash';
// import 'dotenv/config';
// import {NotificationsService} from './notifications.service';
//
// const auth0Token = process.env.AUTH0_TOKEN;
// const auth0Domain = process.env.AUTH0_DOMAIN;
//
// @Controller('notification')
// export class NotificationsController {
//     private readonly logger = new Logger('deelnemersController', true);
//
//     constructor(private readonly notificationsService: NotificationsService) {
//     }
//
//     @Post('standupdated')
//     async create(@Req() req) {
//         return await this.notificationsService.standUpdated();
//     }
// }
