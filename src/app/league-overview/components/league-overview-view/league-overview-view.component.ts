import { Component, OnInit } from '@angular/core';
import { League } from 'src/app/interfaces/league';

@Component({
  selector: 'app-league-overview-view',
  templateUrl: './league-overview-view.component.html',
  styleUrls: ['./league-overview-view.component.scss']
})
export class LeagueOverviewViewComponent implements OnInit {
  public selectedLeague:League | null = null;

  constructor() { }

  ngOnInit(): void {
  }

}
