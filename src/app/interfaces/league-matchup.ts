import { Game } from "./game";
import { LeagueUser } from "./league-user";

export interface LeagueMatchup {
    starters?:Array<string>,
    roster_id?:number,
    teamOne:LeagueUser,
    teamOnePoints:number,
    teamOneStarters:Array<string>,
    teamOneStarterProjections:Array<Game>,
    teamOneStarterStats:Array<Game>,
    teamOneStartersPoints:Array<number>,
    teamTwo:LeagueUser,
    teamTwoPoints:number,
    teamTwoStarters:Array<string>,
    teamTwoStarterProjections:Array<Game>,
    teamTwoStarterStats:Array<Game>,
    teamTwoStartersPoints:Array<number>,
    players?:Array<string>,
    players_points?:{ [key:number]:number },
    starters_points?:Array<number>,
    matchup_id:number,
    points?:number, // total points for team based on league settings
    custom_points?:number, // if commissioner overrides points manually
};