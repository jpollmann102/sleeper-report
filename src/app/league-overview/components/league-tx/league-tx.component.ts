import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { catchError, forkJoin, of, Subject, take, takeUntil } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { Player } from 'src/app/interfaces/player';
import { Transaction } from 'src/app/interfaces/transaction';
import { LeagueService } from '../../services/league.service';
import { PlayerService } from '../../services/player.service';

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
              public playerService:PlayerService) {
    this.playerService.playersLoaded
      .pipe(takeUntil(this.$destroy))
      .subscribe(value => this.getTransactions(this.league, this.leagueUsers))
  }

  ngOnInit(): void {
    if(!this.playerService.loading) this.getTransactions(
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
    if(changes && changes['league']) {
      if(!this.playerService.loading) this.getTransactions(
        changes['league'].currentValue,
        this.leagueUsers
      );
    }

    if(changes && changes['leagueUsers']) {
      if(!this.playerService.loading) this.getTransactions(
        this.league,
        changes['leagueUsers'].currentValue
      );
    }
  }

  getTransactions(league:League | null, leagueUsers:Array<LeagueUser>) {
    if(this.playerService.loading) return;

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
      .subscribe((value) => {
        this.setupTransactions(value, leagueUsers);
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

  setupTransactions(txs:Array<Array<Transaction>>, leagueUsers:Array<LeagueUser>) {
    let allTx:Array<Transaction> = [];
    txs.forEach(wtx => {
      wtx.forEach(tx => {
        allTx = [
          ...allTx,
          tx,
        ];
      });
    });
    allTx = allTx.sort((a,b) => b.created - a.created);
    this.txs = allTx.map(tx => {
      return {
        ...tx,
        creatorUser: leagueUsers.find(lu => lu.user_id === tx.creator),
        leagueUserAdds: this.convertLeagueUserDict(tx.adds, leagueUsers),
        leagueUserDrops: this.convertLeagueUserDict(tx.drops, leagueUsers),
        playerAdds: this.convertPlayerDict(tx.adds),
        playerDrops: this.convertPlayerDict(tx.drops),
      };
    });
  }

  convertPlayerDict(dict:{ [key:number]:number } | null) {
    if(dict === null) return null;

    let returnDict:{ [key:number]:Player | null } = {};
    for(let playerId in dict) {
      const playerMatch = this.playerService.getPlayer(Number(playerId));
      if(playerMatch) {
        returnDict[playerId] = { 
          ...playerMatch, 
          imgLink: this.playerService.getPlayerImg(playerId), 
          teamImgLink: this.leagueService.getTeamLogo(playerMatch.team) 
        };
      } else returnDict[playerId] = null;
    }

    return returnDict;
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
