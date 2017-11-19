import {Component, Inject, Logger} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Quizvraag} from './quizvraag.entity';

@Component()
export class QuizvragenService {
    private readonly logger = new Logger('quizvragenService', true);

    constructor(@Inject('QuizvragenRepositoryToken') private readonly quizvraagRepository: Repository<Quizvraag>) {
    }

    async findAll(): Promise<any[]> {
        return await this.quizvraagRepository.find({
            join: {
                alias: 'quizvraag',
                leftJoinAndSelect: {
                    antwoorden: 'quizvraag.antwoorden',
                },
            },
        });
    }

    async getQuizVoorAflevering(afleveringId): Promise<Quizvraag[]> {
        return await this.quizvraagRepository.find({
            join: {
                alias: 'quizvraag',
                leftJoinAndSelect: {
                    antwoorden: 'quizvraag.antwoorden',
                },
            },
        }).then(response => {
            return response.filter(item => {
                return item.aflevering.toString() === afleveringId;
            });
        });
    }

    async create(quizvraag: Quizvraag) {
        return await this.quizvraagRepository.save(quizvraag);
    }
}
