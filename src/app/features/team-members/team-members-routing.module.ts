import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TeamMembersComponent } from './team-members/team-members.component';

const routes: Routes = [
  {
    path: '**',
    component: TeamMembersComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamMembersRoutingModule { }
