import {Body, Controller, Get, Post} from '@nestjs/common';
import {Kandidaat} from './kandidaat.entity';
import {CreateKandidaatDTO} from './create-kandidaat.dto';
import {KandidatenService} from './kandidaten.service';

@Controller('kandidaten')
export class KandidatenController {

    constructor(private readonly kandidatenService: KandidatenService) {
    }

    @Get()
    async findAll(): Promise<Kandidaat[]> {
        return this.kandidatenService.findAll();
    }

    @Post()
    async create(@Body() createKandidaatDto: CreateKandidaatDTO) {
        const newEntry = Object.assign({}, createKandidaatDto, {});
        await this.kandidatenService.create(newEntry);
        //     .then(success => {
        //     this.calculateAflevering(newEntry);
        // });
    }

    //
    // @Get(':molId/entries')
    // findEntriesByCategory( @Param('molId') molId): Promise<Entry[]> {
    //   return this.entriesService.findEntriesBymol(molId);
    // }

    // calculateAflevering(kandidaat: Kandidaat) {
    //     this.voorspellingRepository.find({where: {aflevering: kandidaat.elimination_round}})
    //         .then(voorspellingen => {
    //             voorspellingen.filter(voorspelling => {
    //                 return voorspelling.afvaller === kandidaat;
    //             }).forEach(correcteVoorspelling => {
    //                 this.afleveringPuntenRepository.save({
    //                     aflevering: correcteVoorspelling.aflevering,
    //                     afvallerpunten: 25,
    //                     deelnemer: correcteVoorspelling.deelnemer,
    //                 });
    //             });
    //         });
    // }
}

//
// @OneToMany(type => Deelnemer, deelnemer => deelnemer.id)
// deelnemer: Deelnemer;
//
// @Column()
// aflevering: number;
//
// @Column()
// molpunten: number;
//
// @Column()
// afvallerpunten: number;
//
// @Column()
// winnaarpunten: number;