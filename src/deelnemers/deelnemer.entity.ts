import {Column, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';
import {Poule} from '../poules/poule.entity';
import {Quizresultaat} from '../quizresultaten/quizresultaat.entity';

@Entity()
@Index(['auth0Identifier'], {unique: true})
export class Deelnemer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    display_name: string;

    @Column({select: false})
    auth0Identifier: string;

    // todo voor livegang nullable weghalen
    @Column({select: false, nullable: true})
    firebaseIdentifier: string;

    @Column({select: false})
    email: string;

    @OneToMany(type => Voorspelling, voorspelling => voorspelling.deelnemer, {
        eager: false, // todo impact nu het op false staat??
    })
    @JoinTable()
    voorspellingen: Voorspelling[];

    @OneToMany(type => Quizresultaat, quizresultaat => quizresultaat.deelnemer)
    @JoinTable()
    tests: Quizresultaat[];

    @ManyToMany(type => Poule, poule => poule.deelnemers)
    poules: Poule[];
}
