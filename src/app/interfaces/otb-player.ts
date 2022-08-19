import { LeagueUser } from "./league-user";
import { Player } from "./player";

export interface OtbPlayer {
    settings:{ otb:number },
    player_id:string,
    leagueUser:LeagueUser | null,
    player:Player | null,
    isDraftPick:boolean,
    draftPick:string | null,
};