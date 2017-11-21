// import { ExceptionFilter, Catch, HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/core';
import { Response } from 'express';

import { UnauthorizedError } from 'express-jwt';
import {Catch, HttpStatus} from '@nestjs/common';
import {ExceptionFilter} from '@nestjs/common/interfaces/exceptions';

@Catch(UnauthorizedError)
export class AppExceptionFilter implements ExceptionFilter {

    catch(exception: UnauthorizedError, response: Response) {
        throw new HttpException({message: exception.message, statusCode: HttpStatus.UNAUTHORIZED}, HttpStatus.UNAUTHORIZED);
    }
}