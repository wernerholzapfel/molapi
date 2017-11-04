import {Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Entity()
export class Deelnemer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    display_name: string;

    @Column()
    email: string;

    @OneToMany(type => Voorspelling, voorspelling => voorspelling.deelnemer)
    voorspellingen: Voorspelling[];
}
