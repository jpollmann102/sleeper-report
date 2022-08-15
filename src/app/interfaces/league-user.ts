import { LeagueRoster } from "./league-roster";
import { LeagueUserMetadata } from "./league-user-metadata";

export interface LeagueUser {
    user_id:string,
    username:string,
    display_name:string,
    avatar:string,
    metadata:LeagueUserMetadata,
    roster:LeagueRoster,
    is_owner:boolean,
}