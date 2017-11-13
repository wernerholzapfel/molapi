import {Body, Controller, Get, Logger, Post, Req, Res} from '@nestjs/common';
import {AfleveringenService} from './afleveringen.service';
import {Aflevering} from './aflevering.entity';
import {CreateAfleveringDto} from './create-aflevering.dto';
import {ManagementClient} from 'auth0';
import * as async from 'async';
import * as jwt_decode from 'jwt-decode';
import 'dotenv/config';

const auth0Token = process.env.AUTH0_TOKEN;
const auth0Domain = process.env.AUTH0_DOMAIN;

@Controller('afleveringen')
export class AfleveringenController {
    private readonly logger = new Logger('afleveringenController', true);
    private management = new ManagementClient({
        domain: auth0Domain,
        token: auth0Token,
    });

    constructor(private readonly afleveringenService: AfleveringenService) {
    }

    @Get()
    async findAll(): Promise<Aflevering[]> {
        return this.afleveringenService.findAll();
    }

    @Post()
    async create(@Res() res, @Req() req, @Body() createAfleveringDto: CreateAfleveringDto) {
        this.logger.log('post aflevering');
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
                        if (!user.app_metadata.hasOwnProperty('admin')) return res.status(403).json('Om wijzigingen door te kunnen voeren moet je admin zijn');
                        callback(null, user);
                    });
                },
                (user, callback) => {
                    this.logger.log('hier is emailadres: ' + user.email);
                    const newAflevering = Object.assign({}, createAfleveringDto);
                    this.afleveringenService.create(newAflevering, res);
                }]);
        }
    }

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