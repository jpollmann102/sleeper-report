import { LeagueUser } from "./league-user";

export interface LeagueDivision {
    division:number,
    avatar:string,
    name:string,
    users:Array<LeagueUser>,
}