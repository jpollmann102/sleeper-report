import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, of, Subject, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Player } from 'src/app/interfaces/player';
import { Transaction } from 'src/app/interfaces/transaction';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';
import { differenceInDays } from 'date-fns';

@Component({
  selector: 'app-league-tx',
  templateUrl: './league-tx.component.html',
  styleUrls: ['./league-tx.component.scss']
})
export class LeagueTxComponent implements OnChanges, OnDestroy, OnInit {
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];
  private readonly $destroy = new Subject<void>();
  private txs:Array<Transaction> = [];
  private shownTxIdx = 0;
  public shownTx:Transaction | null = null;
  public loading = false;
  private interval:any = null;

  constructor(private leagueService:LeagueService,
              private playerService:PlayerService) { }

  ngOnInit(): void {
    this.getTransactions(
      this.league,
      this.leagueUsers
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.interval = null;
    this.$destroy.next();
    this.$destroy.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes) {
      if(changes['league'] && changes['leagueUsers']) {
        this.getTransactions(
          changes['league'].currentValue,
          changes['leagueUsers'].currentValue
        );
      } else if(changes['league']) {
        this.getTransactions(
          changes['league'].currentValue,
          this.leagueUsers
        );
      } else this.getTransactions(
        this.league,
        changes['leagueUsers'].currentValue
      );
    }
  }

  getTransactions(league:League | null, leagueUsers:Array<LeagueUser>) {
    clearInterval(this.interval);
    this.interval = null;
    this.shownTx = null;
    this.txs = [];
    this.shownTxIdx = 0;

    if(league === null) return;

    let weeks:Array<number> = [];
    for(let i = 1; i < league.settings.playoff_week_start; i++) weeks.push(i);

    const obs = weeks.map(
      w => this.leagueService.getTransactions(league.league_id, w)
    );
    
    this.loading = true;
    forkJoin(obs)
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          return of([]);
        })
      )
      .subscribe(async (txs) => {
        this.txs = await this.setupTransactions(txs, leagueUsers);
        this.loading = false;
        if(this.txs.length > 1) {
          this.shownTx = this.txs[this.shownTxIdx];
          if(this.interval === null) {
            this.interval = setInterval(
              () => this.incrementShownTx(),
              6000
            );
          } else {
            clearInterval(this.interval);
            this.interval = setInterval(
              () => this.incrementShownTx(),
              6000
            );
          }
        }
      });
  }

  async setupTransactions(txs:Array<Array<Transaction>>, leagueUsers:Array<LeagueUser>):Promise<Array<Transaction>> {
    let allTx:Array<Transaction> = [];
    txs.forEach(wtx => {
      wtx.forEach(tx => {
        allTx = [
          ...allTx,
          tx,
        ];
      });
    });
    allTx = allTx.filter(tx => {
      const asDate = new Date(tx.created);
      const now = new Date();
      return differenceInDays(now, asDate) < 15;
    })
    allTx = allTx.sort((a,b) => b.created - a.created);
    let finalTx:Array<Transaction> = [];
    for(let i = 0; i < allTx.length; i++) {
      const tx = allTx[i];
      const playerAdds = await this.convertPlayerDict(tx.adds);
      const playerDrops = await this.convertPlayerDict(tx.drops);
      finalTx = [
        ...finalTx,
        {
          ...tx,
          playerAdds,
          playerDrops, 
          creatorUser: leagueUsers.find(lu => lu.user_id === tx.creator),
          leagueUserAdds: this.convertLeagueUserDict(tx.adds, leagueUsers),
          leagueUserDrops: this.convertLeagueUserDict(tx.drops, leagueUsers),
        },
      ];
    }

    return new Promise((resolve, reject) => resolve(finalTx));
  }

  async convertPlayerDict(dict:{ [key:number]:number } | null):Promise<{ [key:number]:Player | null } | null> {
    if(dict === null) return new Promise((resolve, reject) => resolve(null));

    return new Promise(async (resolve, reject) => {
      let returnDict:{ [key:number]:Player | null } = {};
      const playerIds = Object.keys(dict);
      const players = await this.playerService.getPlayers(playerIds.map(k => Number(k)));
      playerIds.forEach((pId) => {
        const playerMatch = players.find(p => p && p.player_id === pId);
        if(playerMatch) {
          returnDict[Number(pId)] = { 
            ...playerMatch,
            teamImgLink: this.leagueService.getTeamLogo(playerMatch.team)
          };
        } else returnDict[Number(pId)] = null;
      });

      resolve(returnDict);
    });

  }

  convertLeagueUserDict(dict:{ [key:number]:number } | null, leagueUsers:Array<LeagueUser>) {
    if(dict === null) return null;

    let returnDict:{ [key:number]:LeagueUser | null } = {};
    for(let playerId in dict) {
      const luMatch = leagueUsers.find(lu => lu.roster.roster_id === dict[playerId]);
      returnDict[playerId] = luMatch ? luMatch : null;
    }

    return returnDict;
  }

  incrementShownTx() {
    if(this.txs.length === 0) this.shownTx = null;
    else {
      this.shownTxIdx += 1;
      this.shownTx = this.txs[(this.shownTxIdx % this.txs.length)];
    }
  }

}
