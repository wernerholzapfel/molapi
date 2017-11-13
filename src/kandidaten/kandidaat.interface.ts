export interface Kandidaat {
    id: string;
    display_name: string;
    winner?: boolean;
    mol?: boolean;
    finalist?: boolean;
    elimination_round?: number;
}