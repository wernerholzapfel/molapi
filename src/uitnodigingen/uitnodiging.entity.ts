import {Column, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Poule} from '../poules/poule.entity';

@Entity()
export class Uitnodiging {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    uniqueIdentifier: string;

    @ManyToOne(type => Poule, poule => Poule)
    @JoinTable()
    poule: Poule;

    @Column({default: false})
    isAccepted: boolean;
}
