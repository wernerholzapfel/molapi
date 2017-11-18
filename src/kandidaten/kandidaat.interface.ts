export interface Kandidaat {
    id: string;
    display_name: string;
    winner?: boolean;
    mol?: boolean;
    finalist?: boolean;
    afgevallen?: boolean;
    aflevering?: number;
}