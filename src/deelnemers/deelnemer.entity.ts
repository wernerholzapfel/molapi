import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {Voorspelling} from '../voorspellingen/voorspelling.entity';

@Entity()
@Index(['auth0Identifier'], {unique: true})
export class Deelnemer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    display_name: string;

    @Column()
    auth0Identifier: string;

    @Column({select: false})
    email: string;

    @OneToMany(type => Voorspelling, voorspelling => voorspelling.deelnemer)
    voorspellingen: Voorspelling[];
}
