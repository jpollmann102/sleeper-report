export interface DraftPick {
    season:string,      // the season this draft pick belongs to
    round:number,       // which round this draft pick is
    roster_id:number,   // original owner's roster_id
    previous_owner_id:number,  // previous owner's roster id (in this trade)
    owner_id:number,    // the new owner of this pick after the trade
}