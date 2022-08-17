import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { League } from 'src/app/interfaces/league';
import { LeagueDivision } from 'src/app/interfaces/league-division';
import { LeagueMetadata } from 'src/app/interfaces/league-metadata';
import { LeagueUser } from 'src/app/interfaces/league-user';

@Component({
  selector: 'app-league-divisions',
  templateUrl: './league-divisions.component.html',
  styleUrls: ['./league-divisions.component.scss']
})
export class LeagueDivisionsComponent implements OnChanges {
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];
  public divisions:Array<LeagueDivision> = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['leagueUsers']) {
      this.setupDivisions(
        changes['leagueUsers'].currentValue,
        this.league
      );
    }

    if(changes && changes['league']) {
      this.setupDivisions(
        this.leagueUsers,
        changes['league'].currentValue
      );
    }
  }

  setupDivisions(users:Array<LeagueUser>, league:League | null) {
    if(league === null) {
      this.divisions = [];
      return;
    }
    
    const divisionKeys:Array<{ nameKey:keyof LeagueMetadata, avatarKey:keyof LeagueMetadata }> = [
      {
        nameKey: 'division_1',
        avatarKey: 'division_1_avatar'
      },
      {
        nameKey: 'division_2',
        avatarKey: 'division_2_avatar'
      },
      {
        nameKey: 'division_3',
        avatarKey: 'division_3_avatar'
      },
      {
        nameKey: 'division_4',
        avatarKey: 'division_4_avatar'
      },
      {
        nameKey: 'division_5',
        avatarKey: 'division_5_avatar'
      },
      {
        nameKey: 'division_6',
        avatarKey: 'division_6_avatar'
      },
    ];
    let divisions:Array<LeagueDivision> = [];

    divisionKeys.forEach((d, idx) => {
      const divisionMembers = users.filter(lu => lu.roster?.settings.division === idx+1);
      if(divisionMembers.length) {
        const sortedDivisionMembers = divisionMembers.sort((last, curr) => this.sortDivisionMembers(last, curr));

        divisions = [
          ...divisions,
          {
            division: idx+1,
            avatar: league.metadata[d.avatarKey],
            name: league.metadata[d.nameKey],
            users: sortedDivisionMembers,
          },
        ];
      }
    });

    this.divisions = divisions;
  }

  getWinPercentage(user:LeagueUser):number {
    const { settings } = user.roster;
    const gamesPlayed = settings.losses + settings.wins + settings.ties;
    return settings.wins / gamesPlayed;
  }

  sortDivisionMembers(last:LeagueUser, curr:LeagueUser):number {
    const lastWinPer = this.getWinPercentage(last);
    const currWinPer = this.getWinPercentage(curr);
    return lastWinPer - currWinPer;
  }

}
