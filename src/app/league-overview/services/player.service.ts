import { Injectable, OnDestroy } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { Game } from 'src/app/interfaces/game';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Player } from 'src/app/interfaces/player';
import { HttpClient } from '@angular/common/http';
import { isBefore, isAfter } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class PlayerService implements OnDestroy {
  private token = 'sleeper-report-players';
  private cacheMap = new Map<number, Player>();
  private cacheTime = '';

  constructor(private fns:AngularFireFunctions,
              private http:HttpClient) {                
    window.onbeforeunload = () => this.ngOnDestroy();
    this.setupPlayerMap();
  }

  ngOnDestroy(): void {
    this.saveCacheMap();
  }

  private saveCacheMap() {
    localStorage.setItem(
      this.token, 
      JSON.stringify({
        cacheMap: Array.from(this.cacheMap),
        cacheTime: this.cacheTime ? this.cacheTime : new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York'
        }),
      })
    );
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

  private getPlayerImg(playerId:string) {
    return `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
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
    console.log('setting up player cache');
    const fromStorage = localStorage.getItem(this.token);
    if(fromStorage) {
      console.log('from storage');
      const parsed = JSON.parse(fromStorage);
      const now = new Date(
        new Date().toLocaleString('en-US', {
          timeZone: 'America/New_York'
        })
      );
      const cachedTime = new Date(parsed.cacheTime);
      const todayRun = new Date(now.setHours(1, 30));
      
      // if right now is not after today's run
      // or the cached time was not before today's run
      // then set the cache
      if(!isAfter(now, todayRun) || !isBefore(cachedTime, todayRun)) {
        console.log('use cache');
        this.cacheMap = new Map(parsed.cacheMap);
        this.cacheTime = cachedTime.toLocaleDateString('en-US', {
          timeZone: 'America/New_York'
        });
      }
    }

    console.log('player cache map', this.cacheMap);
  }

  private setPlayerCache(playerId:number, player:Player | undefined | null) {
    if(player) {
      this.cacheMap.set(playerId, player);
      console.log('player cached', player);
    }
  }

  private getFirestorePlayer(playerIds:Array<number>):Observable<{ players:Array<Player | null> }> {
    const callable = this.fns.httpsCallable('getPlayerInfo');
    return callable({ playerIds });
  }
}

