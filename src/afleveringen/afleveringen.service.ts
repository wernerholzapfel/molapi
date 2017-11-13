import {Component, HttpStatus, Inject} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Aflevering} from './aflevering.entity';

@Component()
export class AfleveringenService {
    constructor(@Inject('AfleveringRepositoryToken') private readonly afleveringRepository: Repository<Aflevering>) {
    }

    async findAll(): Promise<Aflevering[]> {
        try {
            return await this.afleveringRepository.find();
        } catch (err) {
            return err;
        }
    }

    async create(aflevering: Aflevering, res: any) {
        await this.afleveringRepository.save(aflevering).then(response => {
            return res.status(HttpStatus.CREATED).json(response).send();
        }, error => {
            return res.status(HttpStatus.FORBIDDEN).json(error).send();
        });
    }

}