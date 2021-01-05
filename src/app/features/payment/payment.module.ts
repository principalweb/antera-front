import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentComponent } from './payment.component';
import { SharedModule } from '../../shared/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentService } from 'app/core/services/payment.service';

const routes: Routes = [
  {
    path: '',
    component: PaymentComponent,
    resolve : {
      data: PaymentService
    }
  }
];

@NgModule({
  declarations :[
    PaymentComponent
  ],
  imports: [
    RouterModule.forChild(routes),

    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,

    FuseSharedModule,
    FuseConfirmDialogModule,
    SharedModule
  ],
  providers  :[
    PaymentService
  ],
  entryComponents: [

  ]
})
export class FusePaymentModule { }
