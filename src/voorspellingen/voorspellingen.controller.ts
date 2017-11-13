import {Body, Controller, Get, Logger, Param, Post, Req, Res} from '@nestjs/common';

import {CreateVoorspellingDto} from './create-voorspelling.dto';
import {VoorspellingenService} from './voorspellingen.service';
import {Voorspelling} from './voorspelling.entity';
import {ManagementClient} from 'auth0';
import * as async from 'async';
import * as jwt_decode from 'jwt-decode';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;

@Controller('voorspellingen')
export class VoorspellingenController {
    private readonly logger = new Logger('voorspellingenController', true);
    private management = new ManagementClient({
        domain: auth0Domain,
        token: auth0Token,
    });

    constructor(private readonly voorspellingenService: VoorspellingenService) {
    }

    @Get()
    async findAll(): Promise<Voorspelling[]> {
        return this.voorspellingenService.findAll();
    }

    @Post()
    async create(@Res() res, @Req() req, @Body() createVoorspellingDto: CreateVoorspellingDto) {
        const extractedToken = this.getToken(req.headers);
        if (extractedToken) {
            async.waterfall([
                callback => {
                    this.logger.log('start decoding');
                    const decoded: any = jwt_decode(extractedToken);
                    this.logger.log(decoded.sub);
                    callback(null, decoded);
                },
                (decodedUser, callback) => {
                    // todo get id from jwt
                    this.management.getUser({id: decodedUser.sub}, (err, user) => {
                        if (err) {
                            this.logger.log(err.message);
                        }
                        if (!user.email_verified) return res.status(200).json('Om wijzigingen door te kunnen voeren moet je eerst je mail verifieren. Kijk in je mailbox voor meer informatie.');
                        callback(null, user);
                    });
                },
                (user, callback) => {
                    this.logger.log('hier is emailadres: ' + user.email);
                    const newVoorspelling = Object.assign({}, createVoorspellingDto, {
                        created_at: new Date(),
                    });
                    this.voorspellingenService.create(newVoorspelling, user.email, res);
                }]);
        }
    }

    // @Get('deelnemer/:deelnemerId')
    // async findVoorspellingByDeelnemer( @Param('deelnemerId') deelnemerId): Promise<Voorspelling[]> {
    //   return this.voorspellingenService.findVoorspellingenByDeelnemer(  deelnemerId);
    // }

    getToken = headers => {
        if (headers && headers.authorization) {
            const parted = headers.authorization.split(' ');
            if (parted.length === 2) {
                return parted[1];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
}
