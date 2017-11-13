import {Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Entity()
export class Deelnemer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    display_name: string;

    @Column({select: false})
    email: string;

    @OneToMany(type => Voorspelling, voorspelling => voorspelling.deelnemer, {
        eager: true,
    })
    @JoinTable()
    voorspellingen: Voorspelling[];
}
