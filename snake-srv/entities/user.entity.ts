export interface User {
    id: string;
    name: string;
    pw_salt: string;
    pw_hash: string;
    highscore: number;
}
