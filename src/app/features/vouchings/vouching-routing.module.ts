import { VouchingsComponent } from './vouchings.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VouchingsService } from './vouchings.service';

const routes: Routes = [
  {
    path        : '',
    component  : VouchingsComponent,
    data: {
        helpModule: 'Vouching',
    },
    resolve     : {
      vouchings: VouchingsService
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
export class VouchingRoutingModule { }
