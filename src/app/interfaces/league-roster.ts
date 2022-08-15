import { LeagueRosterSettings } from "./league-roster-settings";

export interface LeagueRoster {
    taxi:Array<string>,
    starters:Array<string>,
    settings:LeagueRosterSettings,
    roster_id:number,
    players:Array<string>,
    owner_id:string,
    league_id:string,
}