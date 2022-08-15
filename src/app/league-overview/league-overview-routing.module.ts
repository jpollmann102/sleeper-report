import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeagueOverviewViewComponent } from './components/league-overview-view/league-overview-view.component';

const routes: Routes = [
  {
    path: '',
    component: LeagueOverviewViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeagueOverviewRoutingModule { }
