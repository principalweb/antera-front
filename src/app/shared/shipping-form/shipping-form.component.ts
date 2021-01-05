import { Component, Inject, Input, OnInit, OnDestroy, Output} from '@angular/core';
import { FormBuilder, FormControl, FormGroup,  Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { Subscription ,  Observable } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';
import { MessageService } from 'app/core/services/message.service';
import { Mail, Attachment } from 'app/models/mail';
import { Shipping } from 'app/models';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseMailComposeDialogComponent } from 'app/shared/compose/compose.component';
import { AccountsRelatedContactListComponent } from 'app/shared/accounts-related-contact-list/accounts-related-contact-list.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-shipping-form',
  templateUrl: './shipping-form.component.html',
  styleUrls: ['./shipping-form.component.scss'],
  animations   : fuseAnimations
})
export class ShippingFormDialogComponent implements OnInit,OnDestroy {
    shippingForm: FormGroup;
    action: string;
    service: any;
    shipping: Shipping;

    shippingMethod = [];
    orderDetails : any;
    dialogTitle: string;
    loading = false;
    emailFound = false;
    cuser = '';
    mailToType = 'customer';
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  constructor(
        private formBuilder: FormBuilder,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ShippingFormDialogComponent>,
        public credentialsDialogRef: MatDialogRef<MailCredentialsDialogComponent>,
        public dialogRef3: MatDialogRef<FuseMailComposeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private datePipe: DatePipe,
        private authService: AuthService,
        private api: ApiService,
        private msg: MessageService,
  ) {
        this.cuser = this.authService.getCurrentUser().userId;
        this.action = data.action;
        //this.service = data.service;

       if ( this.action === 'edit' )
        {
            this.shipping = new Shipping(data.shipping);
            this.shipping.orderId =  data.orderId;
            this.shipping.vendorId = data.vendorId;
            this.shipping.id = data.shipping.id;
            this.shipping.arrivalDate = data.shipping.arrivalDate ? new Date(data.shipping.arrivalDate) : null;
            this.shipping.shipDate = data.shipping.shipDate ? new Date(data.shipping.shipDate) : null;
            this.shipping.inhandsDate = data.shipping.inhandsDate ? new Date(data.shipping.inhandsDate) : null;
            this.shipping.dateShipped = data.shipping.dateShipped ? new Date(data.shipping.dateShipped) : null;
            this.shipping.trackNumber = data.shipping.trackNumber;
            this.shipping.note = data.shipping.note;
            this.shipping.modifiedBy = this.cuser;
            this.dialogTitle = 'Edit Shipping Info';
        }
        else
        {
            this.shipping = new Shipping();
            this.shipping.orderId =  data.orderId;
            this.shipping.vendorId = data.vendorId;
            this.shipping.shipDate = data.shipDate ? new Date(data.shipDate) : null;
            this.shipping.inhandsDate = data.inhandsDate ? new Date(data.inhandsDate) : null;
            this.shipping.createdBy = this.cuser;
            this.dialogTitle = 'New Shipping Info';
        }
        if(data.module && data.module === 'workflow') {
            this.getShippingMethodsDropdownWorkFlow();
        } else {
            this.getShippingMethodsDropdown();
        }
        
        this.shippingForm = this.createShippingForm();
        this.getOrderDeatils(data.orderId);

    }

  ngOnInit() {
  }

  ngOnDestroy() {
  }


  getOrderDeatils(id) {
       this.api.getOrderDetails(id)
          .subscribe((response: any[]) => {
               this.orderDetails  = response;
        });

  }


  getShippingMethodsDropdown() {
       this.api.getShippingMethodsDropdown()
          .subscribe((response: any[]) => {
               this.shippingMethod = response;
        });

  }

  getShippingMethodsDropdownWorkFlow() {

     this.api.getDropdownOptions({dropdown: [
         'sys_shippacct_list' 
     ]}).subscribe((response: any[]) => {
         if(response && response[0] && response[0].options) {
             let shippingMethod = this.shipping.shippingMethod;
            response[0].options.map((value)=>{
                this.shippingMethod.push(value.label)    
            })
            if(shippingMethod && shippingMethod !== "") {
                let checkExist = response[0].options.filter(function(v,i) {
            
                    return v.value === shippingMethod.trim();
                }); 
                    
                if(checkExist.length === 0) {
                    this.shippingMethod.push(this.shipping.shippingMethod)  
                }
                console.log("checkExist",checkExist)
            }
          } else {
            this.shippingMethod = [];
         }
            
     });
        
  }

  createShippingForm()
  {
        return this.formBuilder.group({
            id                  : [this.shipping.id],
            orderId             : [this.shipping.orderId],
            vendorId            : [this.shipping.vendorId],
            shippingMethod      : [this.shipping.shippingMethod],
            trackNumber      : [this.action == 'edit' ? {value: this.shipping.trackNumber, disabled: true} : [this.shipping.trackNumber]],
            shipDate            : [this.shipping.shipDate],
            dateShipped         : [this.shipping.dateShipped],
            arrivalDate         : [this.shipping.arrivalDate],
            inhandsDate         : [this.shipping.inhandsDate],
            note                : [this.shipping.note],
            shippingAccount     : [this.shipping.shippingAccount],
            weight              : [this.shipping.weight],
            promoStandRes       : [this.shipping.promoStandRes],
            createdBy           : [this.shipping.createdBy],
            dateCreated         : [this.shipping.dateCreated],
            modifiedBy          : [this.shipping.modifiedBy],
            dateModified        : [this.shipping.dateModified]
        });
    }

    create() {
        if (this.shippingForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.loading = true;
        this.api.createShippingInfo({
                ...this.shippingForm.value
            })
            .subscribe(data => {
            if(data)
              this.msg.show('Shipping Info Saved', '');
                this.loading = false;
                this.dialogRef.close(data);
            }, err => {
                this.loading = false;
                this.dialogRef.close();
            });
    }

    update() {
        if (this.shippingForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.loading = true;

        this.api.updateShippingInfo({
            ...this.shippingForm.value
        })
        .subscribe((data) => {
          if(data)
              this.msg.show('Shipping Info Changed', '');
            this.loading = false;
            this.dialogRef.close(data);
        }, () => {
            this.dialogRef.close();
        });
    }

    clear() {
            this.cuser = this.authService.getCurrentUser().userId;
            this.shipping = new Shipping();
            this.shipping.orderId =  this.data.orderId;
            this.shipping.vendorId = this.data.vendorId;
            this.shipping.shipDate = new Date(this.data.shipDate);
            this.shipping.inhandsDate = new Date(this.data.inhandsDate);
            this.shipping.createdBy = this.cuser;
            this.dialogTitle = 'New Shipping Info';
            this.action = 'new';
            this.shippingForm = this.createShippingForm();

   }
    sendEmail(mailToType)
    {
        this.mailToType = mailToType;
        this.loading = true;
        const userId = this.authService.getCurrentUser().userId;
        this.api.getMailCredentials(userId)
            .subscribe((res) => {
                this.loading = false;
                if (!res || (res && (res.smtpPass == '' || res.smtpPort == '' || res.smtpServer == '' || res.smtpUser == '')))
                {
                    this.credentialsDialogRef = this.dialog.open(MailCredentialsDialogComponent, {
                        panelClass: 'mail-credentials-dialog'
                    });
                    this.credentialsDialogRef.afterClosed()
                        .subscribe((res) => {
                            this.dialogRef = null;
                            if (res && res == 'saved') {
                                this.sendEmail(mailToType);
                            }
                        });
                    return;
                }
                this.composeDialog();

            }, (err) => {
                this.loading = false;
                console.log(err);
            });
    }

    composeDialog(){
        const basicMailData = {
            subject: '',
            body: '',
            to:[]
        }

        let mail = new Mail(basicMailData);


        if (this.mailToType == 'customer') {
            let templateName;
            templateName = 'Shipping Info';
            let tagName;
            tagName = "Shipping Info";
            this.loading = true;
            this.api.processEmailTemplateByName({templateName: templateName,orderId: this.orderDetails.id, vendorId: this.shipping.vendorId, currentUserId: this.cuser}).subscribe((res: any) => {
		mail.subject = res.subject;
		mail.body = res.bodyHtml;
		this.api.getTaggedEmails(this.orderDetails.id, tagName).subscribe((res: any) => {
		         this.loading = false;
		         this.emailFound = false;
		         if(res.status!== undefined && res.status == "success"){
				 res.accounts.forEach((emailEntry) => {
				     if(mail.to.indexOf(emailEntry.email) < 0){
				         //this.emailFound = true;
				         mail.to.push(emailEntry.email);
				     }
				 });
				 res.contacts.forEach((emailEntry) => {
				     if(mail.to.indexOf(emailEntry.email) < 0){
				         this.emailFound = true;
				         mail.to.push(emailEntry.email);
				     }
				 });
		         }
                         if(!this.emailFound){
				this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
				    disableClose: false
				});
				this.confirmDialogRef.componentInstance.confirmButtonText = 'Confirmation : no linked contact with document';
				this.confirmDialogRef.componentInstance.confirmMessage = 'There are no contacts linked to this document, would you like to link them now?';
				this.confirmDialogRef.componentInstance.confirmButtonText = 'Add now';
				this.confirmDialogRef.componentInstance.cancelButtonText = 'May be later';
				this.confirmDialogRef.afterClosed().subscribe(result => {
				    if ( result ) {
					  let arclRef = this.dialog.open(AccountsRelatedContactListComponent, {
					    panelClass: 'accounts-related-contact-list',
					    data: {
					      orderId: this.orderDetails.id,
					      accountId: this.orderDetails.accountId
					    }
					  });
					  arclRef.afterClosed()
					    .subscribe(contact => {
					        this.loading = false;
						this.api.getTaggedEmails(this.orderDetails.id, tagName).subscribe((res: any) => {
							 this.loading = true;
							 if(res.status!== undefined && res.status == "success"){
								 res.accounts.forEach((emailEntry) => {
								     if(mail.to.indexOf(emailEntry.email) < 0){
									 this.emailFound = true;
									 mail.to.push(emailEntry.email);
								     }
								 });
								 res.contacts.forEach((emailEntry) => {
								     if(mail.to.indexOf(emailEntry.email) < 0){
									 this.emailFound = true;
									 mail.to.push(emailEntry.email);
								     }
								 });
							 }
							 this.openComposeDialog(mail);
						});
					    });
				    }else{
				        this.openComposeDialog(mail);
				    }
				    this.confirmDialogRef = null;
				});
                         }else{
                             this.openComposeDialog(mail);
                         }


                });
            });
        /*
            this.api.getContactDetails(this.orderDetails.contactId).subscribe((res: any) => {

                mail.to = [res.email];

                this.dialogRef3 = this.dialog.open(FuseMailComposeDialogComponent, {
                    panelClass: 'compose-mail-dialog',
                    data      : {
                        action: 'Send',
                        mail: mail
                    }
                });
                this.dialogRef3.afterClosed()
                    .subscribe(res => {
                        if ( !res )
                            return;

                        this.dialogRef = null;
                        if ( !res )
                            return;

                        mail = res.mail;
                        if(this.shipping.shippingMethod.startsWith('UPS'))  {
                           mail.body =   'We are glad to inform that you order has shipped. \n Tentative Arrival Date: ' + this.datePipe.transform(this.shipping.arrivalDate,"yyyy-MM-dd") + '\n Shipped By: '+     this.shipping.shippingMethod + '\n Tracking Number:  <a class ="tracking" href = "https://www.ups.com/track" >' + this.shipping.trackNumber + '</a>';
                        } else if(this.shipping.shippingMethod.startsWith('Fedex')) {
                           mail.body =   'We are glad to inform that you order has shipped. \n Tentative Arrival Date: ' + this.datePipe.transform(this.shipping.arrivalDate,"yyyy-MM-dd") + '\n Shipped By: '+     this.shipping.shippingMethod + '\n Tracking Number:  <a class ="tracking" href = "https://www.fedex.com/apps/fedextrack/?action=track"  >' + this.shipping.trackNumber + '</a>';
                        }
                        const data = new FormData();
                        data.append('userId', this.authService.getCurrentUser().userId);
                        data.append('to', mail.to.join(','));
                        data.append('from', mail.from);
                        data.append('subject', mail.subject);
                        data.append('body', mail.body);
                        this.api.sendMailSMTP(data)
                            .subscribe((res: any) => {
                                if (res == true) {
                                    this.msg.show('Succesfully sent an email','success');
                                    this.loading = false;
                                    this.dialogRef.close();
                                }
                                else{
                                    this.msg.show('Failed sending an email','error');
                                }
                            }, (err) => {
                                console.log(err);
                            });

                    });

            });
            */
        }
    }
    openComposeDialog(mail){
        this.loading = false;
	this.dialogRef3 = this.dialog.open(FuseMailComposeDialogComponent, {
	    panelClass: 'compose-mail-dialog',
	    data      : {
		action: 'Send',
		mail: mail
	    }
	});

	this.dialogRef3.afterClosed()
	    .subscribe(res => {
		if ( !res )
		    return;

		//this.dialogRef = null;
		if ( !res )
		    return;

		mail = res.mail;
		const data = new FormData();
		data.append('userId', this.authService.getCurrentUser().userId);
		data.append('to', mail.to.join(','));
		data.append('from', mail.from);
		data.append('subject', mail.subject);
		data.append('body', mail.body);
		this.api.sendMailSMTP(data)
		    .subscribe((res: any) => {
                if (res.status && res.status == 'success') {
                    this.msg.show('Email sent','success');
                    this.loading = false;
                    this.dialogRef.close();
                }
                else{
                    this.msg.show('Failed to send email','error');
                }
		    }, (err) => {
                this.msg.show(err.error.msg, 'error');
                console.log('ERROR', err);
		    });

	    });
    }
}
