import { Injectable, OnDestroy } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Player } from 'src/app/interfaces/player';
import { HttpClient } from '@angular/common/http';
import { isBefore, isAfter } from 'date-fns';
import { LeagueService } from './league.service';
import { Injury } from 'src/app/interfaces/injury.enum';

@Injectable({
  providedIn: 'root'
})
export class PlayerService implements OnDestroy {
  private token = 'sleeper-report-players';
  private cacheMap = new Map<number, Player>();
  private cacheTime:Date | null = null;

  constructor(private fns:AngularFireFunctions,
              private leagueService:LeagueService,
              private http:HttpClient) {                
    window.onbeforeunload = () => this.ngOnDestroy();
    this.setupPlayerMap();
  }

  ngOnDestroy(): void {
    this.saveCacheMap();
  }

  private saveCacheMap() {
    if(this.cacheMap.size > 0) {
      localStorage.setItem(
        this.token, 
        JSON.stringify({
          cacheMap: Array.from(this.cacheMap),
          cacheTime: this.cacheTime ? this.cacheTime : Date.now(),
        })
      );
    }
  }

  async getPlayers(playerIds:Array<number>) {
    const cachedPlayers = playerIds
      .map(id => this.cacheMap.get(id))
      .filter(p => p !== undefined);
    const notFoundPlayers = playerIds.filter(id => !cachedPlayers.find(p => Number(p!.player_id!) === id));
    const fsPlayers = await lastValueFrom(
      this.getFirestorePlayer(notFoundPlayers)
    );
    const withImgLink = fsPlayers.players.map(fsp => {
      if(fsp === null) return null;
      return {
        ...fsp,
        imgLink: this.getPlayerImg(fsp.player_id),
      };
    });
    notFoundPlayers.forEach(
      pId => this.setPlayerCache(
        pId, 
        withImgLink.find(fsp => fsp !== null && Number(fsp.player_id) === pId)
      )
    );
    return Promise.all<Array<Player | null | undefined>>([
      ...cachedPlayers,
      ...withImgLink,
    ]);
  }

  public getPlayerImg(playerId:string) {
    return `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
  }

  public getInjuryStatusText(injury:string | null | undefined) {
    if(injury === Injury.QUESTIONABLE) return 'Q';
    if(injury === Injury.DOUBTFUL) return 'D';
    if(injury === Injury.IR) return 'IR';
    if(injury === Injury.PUP) return 'PUP';
    if(injury === Injury.OUT) return 'O';
    return '';
  }

  public getPlayerTeamImg(player:Player | undefined | null) {
    if(player) return this.leagueService.getTeamLogo(player.team);
    else return 'assets/football-helmet.png';
  }

  private createStringRoster(roster:Array<string>):string {
    let stringRoster = '[';
    roster.forEach((p, idx) => {
      stringRoster += `"${p}"`;
      if(idx < roster.length-1) stringRoster += ',';
    });
    stringRoster += ']';
    return stringRoster;
  }

  public getPlayerStats(year:number | string) {
    return this.http.get(`https://api.sleeper.com/stats/nfl/${year}?season_type=regular&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=pts_dynasty_ppr`);
  }

  public getPlayerStatsAndProjections(week:number, roster:Array<string>) {
    const stringRoster = this.createStringRoster(roster);
    const query = `query get_player_score_and_projections_batch {
      stat: stats_for_players_in_week(sport:"nfl",season:"2022",category:"stat",season_type:"regular",week:${week},player_ids:${stringRoster}) {
        game_id
        opponent
        player_id
        stats
        team
        week
        season
      }
      proj: stats_for_players_in_week(sport:"nfl",season:"2022",category:"proj",season_type:"regular",week:${week},player_ids:${stringRoster}) {
        game_id
        opponent
        player_id
        stats
        team
        week
        season
      }
    }`;

    return this.http.post<{ data:{ stat:Array<Game>, proj:Array<Game> }}>(
      `https://sleeper.com/graphql`,
      {
        operationName: "get_player_score_and_projections_batch",
        variables: {},
        query
      }
    );
  }

  private setupPlayerMap() {
    const fromStorage = localStorage.getItem(this.token);
    if(fromStorage) {
      const parsed = JSON.parse(fromStorage);
      const now = new Date();
      const cachedTime = new Date(parsed.cacheTime);
      const todayRun = new Date(now);
      todayRun.setHours(1, 30);
      
      // if right now is not after today's run
      // or the cached time was not before today's run
      // then set the cache
      if(!isAfter(now, todayRun) || !isBefore(cachedTime, todayRun)) {
        this.cacheMap = new Map(parsed.cacheMap);
        this.cacheTime = new Date(parsed.cacheTime);
      }
    }

  }

  private setPlayerCache(playerId:number, player:Player | undefined | null) {
    if(player) {
      this.cacheMap.set(playerId, player);
    }
  }

  private getFirestorePlayer(playerIds:Array<number>):Observable<{ players:Array<Player | null> }> {
    const callable = this.fns.httpsCallable('getPlayerInfo');
    return callable({ playerIds });
  }
}

