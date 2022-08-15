import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { catchError, of, take } from 'rxjs';
import { League } from 'src/app/interfaces/league';
import { AuthService } from 'src/app/services/auth.service';
import { LeagueService } from '../../services/league.service';

@Component({
  selector: 'app-leagues-sidepanel',
  templateUrl: './leagues-sidepanel.component.html',
  styleUrls: ['./leagues-sidepanel.component.scss']
})
export class LeaguesSidepanelComponent implements OnInit {
  @Output() leagueSelected = new EventEmitter<League>();
  @Input() selectedLeague:League | null = null;
  public leagues:Array<League> = [];
  public loading = false;
  public error = '';

  constructor(private authService:AuthService,
              private leagueService:LeagueService) {
    this.leagueService.nflInfoLoaded
      .pipe(
        take(1)
      )
      .subscribe(() => this.getLeagues());
  }

  ngOnInit(): void {
    if(this.leagueService.nflInfo) this.getLeagues();
  }

  getLeagues() {
    if(!this.authService.authUser) return;

    this.loading = true;
    this.error = '';

    this.leagueService.getUserLeagues(
      this.authService.authUser.user_id,
      this.leagueService.getCurrentSeason()
    )
      .pipe(
        take(1),
        catchError((error) => {
          console.error(error);
          this.error = error;
          return of([]);
        })
      )
      .subscribe((value) => {
        console.log('leagues', value);
        this.leagues = value;
        if(value.length) this.leagueSelected.emit(value[0]);
        this.loading = false;
      });
  }

}
