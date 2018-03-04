// import {Component, HttpStatus, Logger} from '@nestjs/common';
//
// import {HttpException} from '@nestjs/core';
//
// @Component()
// export class NotificationsService {
//     private readonly logger = new Logger('NotificationsService', true);
//
//     constructor() {
//     }
//
//     async standUpdated(): Promise<any> {
//
//         return await this.deelnemerRepository.find(
//             {
//                 join: {
//                     alias: 'deelnemer',
//                     leftJoinAndSelect: {
//                         voorspellingen: 'deelnemer.voorspellingen',
//                     },
//                 },
//             },
//         ).catch((err) => {
//             throw new HttpException({message: err.message, statusCode: HttpStatus.BAD_REQUEST}, HttpStatus.BAD_REQUEST);
//         });
//     }
// }
