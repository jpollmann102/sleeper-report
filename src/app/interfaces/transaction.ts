import { DraftPick } from "./draft-pick";
import { LeagueUser } from "./league-user";
import { Player } from "./player";
import { TransactionType } from "./transaction-type.enum";

export interface Transaction {
    type:TransactionType, // could be waiver, free_agent or trade as well
    transaction_id:string,
    status_updated:number,
    status:string,
    roster_ids:Array<number>, // roster_ids involved in this transaction
    leg:number, // in football, this is the week
    drops:{ [key:number]:number } | null,
    leagueUserDrops:{ [key:number]:LeagueUser | null } | null,
    playerDrops:{ [key:number]:Player | null } | null,
    draft_picks:Array<DraftPick>,
    creator:string,  // user id who initiated the transaction
    creatorUser:LeagueUser | undefined,
    tradeUsers:Array<LeagueUser | undefined> | null,
    created:number,
    consenter_ids:Array<number>, // roster_ids of the people who agreed to this transaction
    adds:{ [key:number]:number } | null,
    leagueUserAdds?:{ [key:number]:LeagueUser | null } | null,
    playerAdds:{ [key:number]:Player | null } | null,
};