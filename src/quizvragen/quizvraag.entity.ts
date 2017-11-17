import {Entity} from 'typeorm/decorator/entity/Entity';
import {Column, JoinTable, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Quizantwoord} from '../quizantwoorden/quizantwoord.entity';

@Entity()

export class Quizvraag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    vraag: string;

    @Column()
    aflevering: number;

    @OneToMany(type => Quizantwoord, quizantwoord => quizantwoord.vraag)
    @JoinTable()
    antwoorden: Quizantwoord[];
}