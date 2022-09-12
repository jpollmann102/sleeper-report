import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeagueOverviewRoutingModule } from './league-overview-routing.module';
import { LeaguesSidepanelComponent } from './components/leagues-sidepanel/leagues-sidepanel.component';
import { LeagueOverviewViewComponent } from './components/league-overview-view/league-overview-view.component';
import { LeagueOverviewComponent } from './components/league-overview/league-overview.component';
import { SharedModule } from '../shared/shared.module';
import { LeagueRowComponent } from './components/league-row/league-row.component';
import { LeagueDivisionsComponent } from './components/league-divisions/league-divisions.component';
import { DivisionComponent } from './components/division/division.component';
import { DivisionUserComponent } from './components/division-user/division-user.component';
import { LeagueMatchupsComponent } from './components/league-matchups/league-matchups.component';
import { MatchupComponent } from './components/matchup/matchup.component';
import { PowerRankingComponent } from './components/power-ranking/power-ranking.component';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { LeagueTxComponent } from './components/league-tx/league-tx.component';
import { TxComponent } from './components/tx/tx.component';
import { TxFaComponent } from './components/tx-fa/tx-fa.component';
import { TxWaiverComponent } from './components/tx-waiver/tx-waiver.component';
import { TxTradeComponent } from './components/tx-trade/tx-trade.component';
import { TxPlayerComponent } from './components/tx-player/tx-player.component';
import { LeagueOtbComponent } from './components/league-otb/league-otb.component';
import { UserTradeBlockComponent } from './components/user-trade-block/user-trade-block.component';
import { TradeBlockPlayerComponent } from './components/trade-block-player/trade-block-player.component';
import { LeagueStatsComponent } from './components/league-stats/league-stats.component';
import { PlayerLeadersComponent } from './components/player-leaders/player-leaders.component';
import { LeagueLeadersComponent } from './components/league-leaders/league-leaders.component';
import { WeeklyHiLoComponent } from './components/weekly-hi-lo/weekly-hi-lo.component';
import { TxTradeUserHaulComponent } from './components/tx-trade-user-haul/tx-trade-user-haul.component';
import { PlayerPerformanceDirective } from './directives/player-performance.directive';
import { PlayerInjuryDirective } from './directives/player-injury.directive';
import { PlayerPositionDirective } from './directives/player-position.directive';

@NgModule({
  declarations: [
    LeaguesSidepanelComponent,
    LeagueOverviewViewComponent,
    LeagueOverviewComponent,
    LeagueRowComponent,
    LeagueDivisionsComponent,
    DivisionComponent,
    DivisionUserComponent,
    LeagueMatchupsComponent,
    MatchupComponent,
    PowerRankingComponent,
    LeagueTxComponent,
    TxComponent,
    TxFaComponent,
    TxWaiverComponent,
    TxTradeComponent,
    TxPlayerComponent,
    LeagueOtbComponent,
    UserTradeBlockComponent,
    TradeBlockPlayerComponent,
    LeagueStatsComponent,
    PlayerLeadersComponent,
    LeagueLeadersComponent,
    WeeklyHiLoComponent,
    TxTradeUserHaulComponent,
    PlayerPerformanceDirective,
    PlayerInjuryDirective,
    PlayerPositionDirective,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgChartsModule,
    LeagueOverviewRoutingModule
  ]
})
export class LeagueOverviewModule { }
