import { GameStats } from "./game-stats"

export interface Game {
    game_id:string,
    opponent:string,
    player_id:string,
    season:string,
    stats:GameStats,
    team:string,
    week:number,
};