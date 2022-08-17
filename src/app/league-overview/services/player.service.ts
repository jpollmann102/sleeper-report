import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, filter, of, take } from 'rxjs';
import { Game } from 'src/app/interfaces/game';
import { Player } from 'src/app/interfaces/player';

type PlayerDict = {
  [key:string]:Player,
};

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private token = 'sleeper-report-players';
  private players:PlayerDict = {};
  private error = false;
  public loading = false;

  constructor(private http:HttpClient) {
    this.setupPlayerDict();
  }

  public getPlayer(playerId:number):Player | undefined {
    return this.players[playerId];
  }

  public getPlayerImg(playerId:string) {
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

  private setupPlayerDict() {
    this.loading = true;

    const fromStorage = localStorage.getItem(this.token);
    if(fromStorage) {
      const parsed = JSON.parse(fromStorage);

      const now = Date.now();
      if(now - parsed.pullTime > 8.64e+7) this.getPlayers();
      else {
        this.players = parsed.players;
        this.loading = false;
      }

    } else this.getPlayers();
  }

  private getPlayers() {
    this.http.get<PlayerDict>('https://api.sleeper.app/v1/players/nfl')
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          this.error = true;
          return of({});
        })
      )
      .subscribe((value) => {
        this.filterPlayers(value);
        this.loading = false;
      });
  }

  private filterPlayers(players:PlayerDict) {
    const filteredPlayers:PlayerDict = {};

    for(let player in players) {
      if(players[player].search_rank < 301) filteredPlayers[player] = {
        ...players[player],
      };
    };

    this.players = filteredPlayers;
    if(!this.error) this.savePlayers(filteredPlayers);
  }

  private savePlayers(players:PlayerDict) {
    const savedPlayerData = {
      players,
      pullTime: Date.now(),
    };
    localStorage.setItem(this.token, JSON.stringify(savedPlayerData));
  }
}
