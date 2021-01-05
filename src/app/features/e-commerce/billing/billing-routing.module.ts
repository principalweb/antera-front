import { BillingDetailsComponent } from './billing-details/billing-details.component';
import { BillingComponent } from './billing.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EcommerceBillingService } from 'app/core/services/billing.service';
import { EcommerceOrderService } from '../order.service';

const routes: Routes = [
    {
        path     : '',
        component: BillingComponent,
        pathMatch: 'full',
        resolve  : {
            billing: EcommerceBillingService
        }
    },
    {
        path: ':id',
        component: BillingDetailsComponent,
        resolve: {
            data: EcommerceOrderService
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
export class BillingRoutingModule { }
