import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { PaymentMethodService } from '../payment-mehtod.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DropdownOption } from 'app/models/dropdown-option';
import { DropdownOptionFormComponent } from '../../dropdowns/dropdown-option-form/dropdown-option-form.component';
import { MessageService } from 'app/core/services/message.service';
import { PaymentMethodFormComponent } from '../payment-method-form/payment-method-form.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payment-method-list',
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class PaymentMethodListComponent implements OnInit {

  onDropdownOptionsChangedSubscription: Subscription;
  paymentMethodList = [];
  dialogRef: any;
  loading = false; 
  pMethodList = ['Check', 'Credit_Card', 'ACH', 'Cash', 'Other'];
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  constructor(
    private service: PaymentMethodService,
    public dialog: MatDialog,
    private msg: MessageService,  
  ) {}

  ngOnInit(): void {
    this.getPaymentMethodList();
  }

  getPaymentMethodList() {
    let paymentMethodList = []
    this.service.getPaymentMethods().subscribe((response:any) => {
        response.map((obj)=> {
          obj.enable = obj.enable === "1" ? true : false;
          if(this.pMethodList.includes(obj.paymentValue)) {
            obj.edit = false;
            obj.delete = false;
          } else {
            obj.edit = true;
            obj.delete = true;
          }
          paymentMethodList.push(obj);
        }) 
        this.paymentMethodList = paymentMethodList;
    });
  }


  ngOnDestroy() {
    
  }

  sliderToggled(item, ev){
    item.enable = ev.checked;
    this.service.updatePaymentMethodStatus({ id:item.id, enable: ev.checked });
  }

  add() {
    this.dialogRef = this.dialog.open(PaymentMethodFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'new',
          
      }
    });
    this.dialogRef.afterClosed()
      .subscribe((paymentMethod: DropdownOption) => {
          if ( !paymentMethod ) return;
          this.loading = true;
          const data = paymentMethod
          this.service.createPaymentMethod(data)
            .subscribe((response:any) => {
              if(response.msg) {
                this.msg.show(response.msg, 'success');
              } else {
                this.msg.show('Payment method created successfully', 'success');
              }
              
              this.loading = false;
              this.getPaymentMethodList();
            }, err => {
              this.msg.show('Error occurred creating a Payment Method', 'error');
              this.loading = false;
            });
      });    
  }

  edit(data) {
    this.dialogRef = this.dialog.open(PaymentMethodFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
          action: 'edit',
          data: data
      }
    });
    this.dialogRef.afterClosed()
      .subscribe((paymentMethod) => {
         if ( !paymentMethod ) return;
          this.loading = true;
          const data = paymentMethod
          this.service.updatePaymentMethod(data)
            .subscribe((response:any) => {
              if(response.msg) {
                this.msg.show(response.msg, 'success');
              } else {
                this.msg.show('Payment method updated successfully', 'success');
              }
              
              this.loading = false;
              this.getPaymentMethodList();
            }, err => {
              this.msg.show('Error occurred updating payment method', 'error');
              this.loading = false;
            });
      });   
  }

  delete(data) {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
          this.service.deletePaymentMethod({id: data.id})
          .subscribe(() => {
            this.msg.show('Payment Method deleted successfully', 'success');
            this.loading = false;
            this.getPaymentMethodList();
          }, err => {
            this.msg.show('Error occurred deleting a Payment Method', 'error');
            this.loading = false;
          });
        }
        this.confirmDialogRef = null;
    });
    
  }
}