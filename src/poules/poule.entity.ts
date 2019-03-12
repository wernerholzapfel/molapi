import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Deelnemer} from '../deelnemers/deelnemer.entity';

@Entity()
export class Poule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    poule_name: string;

    @ManyToMany(type => Deelnemer)
    @JoinTable()
    deelnemers: Deelnemer[];

    @ManyToMany(type => Deelnemer)
    @JoinTable()
    admins: Deelnemer[];
}
