import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, filter, of, take } from 'rxjs';
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

  private setupPlayerDict() {
    this.loading = true;

    const fromStorage = localStorage.getItem(this.token);
    if(fromStorage) {
      const parsed = JSON.parse(fromStorage);

      const now = Date.now();
      if(now - parsed.pullTime > 8.64e+7) this.getPlayers();
      else {
        this.players = parsed.players;
        console.log('players', this.players);
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
    console.log('players', this.players);
  }

  private savePlayers(players:PlayerDict) {
    const savedPlayerData = {
      players,
      pullTime: Date.now(),
    };
    localStorage.setItem(this.token, JSON.stringify(savedPlayerData));
  }
}
