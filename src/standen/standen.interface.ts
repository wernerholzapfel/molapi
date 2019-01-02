export interface Stand {
    deelnemerId: string;
    display_name: string;
    molpunten: number;
    afvallerpunten: number;
    winnaarpunten: number;
    quizpunten: number;
    totaalpunten: number;
    delta_totaalpunten: number;
    positie?: number;
}

export interface Stand2 {
    deelnemers: Stand[];
}
export interface TestStand {
    deelnemerId: string;
    quizpunten: number;
    previous_quizpunten: number;
}