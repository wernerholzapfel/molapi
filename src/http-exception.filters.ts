// import {UnauthorizedError} from 'express-jwt';
// import {Catch, HttpException, HttpStatus} from '@nestjs/common';
// import {ExceptionFilter} from '@nestjs/common/interfaces/exceptions';
// import {ArgumentsHost} from '@nestjs/common/interfaces/features/arguments-host.interface';
//
// @Catch(UnauthorizedError)
// export class AppExceptionFilter implements ExceptionFilter {
//
//     catch(exception: UnauthorizedError, host: ArgumentsHost) {
//         throw new HttpException({
//             message: exception.message,
//             statusCode: HttpStatus.UNAUTHORIZED,
//         }, HttpStatus.UNAUTHORIZED);
//     }
// }
