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
