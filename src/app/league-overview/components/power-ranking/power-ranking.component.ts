import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { League } from 'src/app/interfaces/league';
import { LeagueUser } from 'src/app/interfaces/league-user';
import { ChartConfiguration, ChartData, ChartType, ChartDataset } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LeagueRosterSettings } from 'src/app/interfaces/league-roster-settings';

@Component({
  selector: 'app-power-ranking',
  templateUrl: './power-ranking.component.html',
  styleUrls: ['./power-ranking.component.scss']
})
export class PowerRankingComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  @Input() league:League | null = null;
  @Input() leagueUsers:Array<LeagueUser> = [];
  public barChartOptions:ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        min: 0
      }
    },
    plugins: {
      legend: {
        display: false,
      },
    }
  };
  public barChartType:ChartType = 'bar';
  public barChartData:ChartData<'bar'> = {
    labels: [],
    datasets: [],
  };

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes && changes['leagueUsers']) {
      this.setupChartData(changes['leagueUsers'].currentValue);
    }
  }

  calculatePowerRank(settings:LeagueRosterSettings) {
    // ((50*wins) - (25*losses) + (points for)) = points
    // final points = (streak*.1) * (points) ????
    const { losses, wins, fpts } = settings;
    const pts = (50 * wins) - (25 * losses) + fpts;
    return pts;
  }

  setupChartData(leagueUsers:Array<LeagueUser> | null) {
    const newDatasets:Array<ChartDataset<"bar", number[]>> = [
      {
        data: [],
        label: '',
        backgroundColor: [
          'rgb(3,4,19)',
        ],
        hoverBackgroundColor: [
          'rgb(13,110,253)',
        ],
      },
    ];

    let teamPowerMap:Array<{ label:string, teamPower:number }> = [];

    leagueUsers?.forEach(lu => {
      let label = '';
      if(lu.metadata.team_name) label = lu.metadata.team_name;
      else label = lu.display_name;

      const teamPower = this.calculatePowerRank(lu.roster.settings);

      teamPowerMap = [
        ...teamPowerMap,
        {
          label,
          teamPower,
        },
      ];
    });

    teamPowerMap = teamPowerMap.sort((a,b) => b.teamPower - a.teamPower);
    newDatasets[0].data = teamPowerMap.map(t => t.teamPower);

    this.barChartData = {
      labels: teamPowerMap.map(t => t.label),
      datasets: newDatasets,
    };
    this.chart?.update();
  }

}
