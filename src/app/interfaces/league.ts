import { LeagueMetadata } from "./league-metadata";
import { LeagueScoringSettings } from "./league-scoring-settings";
import { LeagueSetting } from "./league-setting";

export interface League {
    total_rosters:number,
    status:string,
    sport:string,
    season_type:string,
    season:string,
    bracket_id:string | null,
    loser_bracket_id:string | null,
    previous_league_id:string,
    name:string,
    league_id:string,
    draft_id:string,
    avatar:string,
    settings:LeagueSetting,
    metadata:LeagueMetadata,
    scoring_settings:LeagueScoringSettings,
    roster_positions:Array<string>,
}