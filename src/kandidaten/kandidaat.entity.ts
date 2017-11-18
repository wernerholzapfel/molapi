import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Kandidaat {
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
    afgevallen: boolean;

    @Column({nullable: true})
    aflevering: number;
}
