// import {Mol} from './mollen/mol.entity';
// import * as async from 'async';
// import _ from 'lodash';
//
// let exports = module.exports = {};
//
// const afvallerpunten = 15;
// const foutievemolpunten = -15;
// const molpunten = 15;
// const laatsteaflevering = 3; // todo move it to 10 or make extra boolean parameter
//
// function berekenAfvaller(afvaller, molList: Mol[], aflevering: number) {
//     const mol = _.find(molList, molItem => molItem.laatsteaflevering === aflevering);
//     if (mol.name === afvaller) {
//         return afvallerpunten;
//     }
//     else return 0;
// }
//
// function berekenLaatseaflevering(molList: Mol[], aflevering: number) {
//     // todo model aanpassen zodat laatste aflevering te bepalen is
//     const mol = _.find(molList, molItem => (molItem.mol === true && molItem.laatsteaflevering === aflevering));
//     if (aflevering === 3) {
//         return true;
//     }
//     else return false;
// }
//
// function berekenMol(molvoorspelling, molList: Mol[], aflevering, callback) {
//     async.waterfall([
//         callback => {
//             const punten = 0;
//             let molafgevallenpunten = 0;
//
//             const afvaller = _.find(molList, afvallerItem => afvallerItem.laatsteaflevering === aflevering);
//             if (afvaller.name === molvoorspelling.mol) {
//                 molafgevallenpunten = molafgevallenpunten + foutievemolpunten;
//             }
//
//             callback(null, molvoorspelling, molList, afvaller, punten, molafgevallenpunten);
//         },
//         (molvoorspelling, molList: Mol[], afvaller, punten, molafgevallenpunten, callback) => {
//             var mol = _.find(molList, mol => mol.mol === true);
//             callback(null, molvoorspelling, molList, afvaller, punten, molafgevallenpunten, mol)
//         },
//         (molvoorspelling, molList, afvaller, punten, molafgevallenpunten, mol, callback) => {
//             console.log(aflevering);
//             if (mol && aflevering === laatsteaflevering) {
//                 molvoorspellingenModel.count({
//                     molloot: molvoorspelling.molloot,
//                     mol: mol.name,
//                 }, (err, count) => {
//                     console.log('hoevaak mol goed: ' + count);
//                     punten = punten + ((count + 1) * count / 2 * molpunten);
//                     console.log('mol punten: ' + punten);
//                     callback(null, afvaller, punten, molafgevallenpunten, mol);
//
//                 });
//             }
//             else {
//                 callback(null, afvaller, punten, molafgevallenpunten, mol);
//             }
//         },
//     ], (err, afvaller, totaalpunten, molafgevallenpunten, mol) => {
//         console.log('dit zijn de totaalpunten voor de mol: ' + totaalpunten);
//         callback(null, molvoorspelling, molList, afvaller, mol, totaalpunten, molafgevallenpunten)
//     });
// }
