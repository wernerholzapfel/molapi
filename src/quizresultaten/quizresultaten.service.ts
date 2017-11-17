import {Component, Inject, Logger} from '@nestjs/common';
import {Repository} from 'typeorm';
import {Quizresultaat} from './quizresultaat.entity';

@Component()
export class QuizresultatenService {
    private readonly logger = new Logger('quizresultatenService', true);

    constructor(@Inject('QuizresultatenRepositoryToken') private readonly quizresultaatRepository: Repository<Quizresultaat>) {
    }

    async findAll(): Promise<any[]> {
        return await this.quizresultaatRepository.find({
            join: {
                alias: 'quizresultaat',
                leftJoinAndSelect: {
                    antwoord: 'quizresultaat.antwoord',
                    deelnemer: 'quizresultaat.deelnemer',
                    vraag: 'quizresultaat.vraag',
                },
            },
        });
    }

    async create(quizresultaat: Quizresultaat) {
        return await this.quizresultaatRepository.save(quizresultaat);
    }
}
