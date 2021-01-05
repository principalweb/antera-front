import { ApCreditComponent } from './ap-credit.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path        : '',
    component  : ApCreditComponent,
    data: {
        helpModule: 'CRM',
    },
  },
  {
    path        : 'create',
    component  : ApCreditComponent,
    data: {
        helpModule: 'CRM',
    }
  },
  {
    path        : 'update/:apCreditId',
    component  : ApCreditComponent,
    data: {
        helpModule: 'CRM',
    }
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ApCreditRoutingModule { }
