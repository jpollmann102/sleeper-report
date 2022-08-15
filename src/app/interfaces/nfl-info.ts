export interface NflInfo {
    week:number, // week
    season_type:string, // pre, post, regular
    season_start_date:string, // regular season start
    season:string, // current season
    previous_season:string,
    leg:number, // week of regular season
    league_season:string, // active season for leagues
    league_create_season:string, // flips in December
    display_week:number // Which week to display in UI, can be different than week
}