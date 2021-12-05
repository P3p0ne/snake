export interface User {
    id: string;
    username: string;
    pw_hash: string;
    highscore: number;
    access_token?: string;
}
