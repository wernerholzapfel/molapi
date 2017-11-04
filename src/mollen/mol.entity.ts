import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Mol {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    display_name: string;

    @Column()
    image_url: string;

    @Column({nullable: true})
    winner: boolean;

    @Column({nullable: true})
    mol: boolean;

    @Column({nullable: true})
    finalist: boolean;

    @Column({nullable: true})
    elimination_round: number;


}
