import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ViewImageComponent } from 'app/shared/view-image/view-image.component';


import { FaqService } from './faq.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FaqFormComponent } from './faq-form/faq-form.component';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AuthService } from 'app/core/services/auth.service';
import { Faq } from 'app/models/faq';
import { MessageService } from 'app/core/services/message.service';
import { filter } from 'lodash';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

@Component({
    selector   : 'fuse-faq',
    templateUrl: './faq.component.html',
    styleUrls  : ['./faq.component.scss'],
    animations   : fuseAnimations
})
export class FuseFaqComponent implements OnInit, OnDestroy
{
    faqs: any = [];
    faqsApproved: any = [];
    faqsPending: any = [];

    step = 0;
    searchInput;
    onFaqsChangedSubscription: Subscription;
    userType: string;

    dialogRef: any;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    loading = false;

    constructor(
        private faqService: FaqService,
        public dialog: MatDialog,
        private authServie: AuthService,
        private msg: MessageService
    )
    {
        this.searchInput = new FormControl('');
        this.userType = this.authServie.getCurrentUser().userType;
    }

    ngOnInit()
    {
        this.onFaqsChangedSubscription =
            this.faqService.onFaqsChanged
                .subscribe((response: any) => {
                    this.faqs = response;
                    this.faqsApproved = filter(this.faqs, {status: 'Approved'});
                    this.faqsApproved.forEach((faq) => {
                        // TODO find the tipe of faq
                        if(faq.link){
                        faq.linkArray = faq.link.split('\n');}
                        if(faq.imageContent!=''){
                            faq.imageContent=JSON.parse(faq.imageContent);
                        }
                    });
                    if (this.authServie.getCurrentUser().userType == 'AnteraAdmin'){
                        this.faqsPending = filter(this.faqs, {status: 'Pending'});
                        this.faqsPending.forEach((faq) => {
                            
                            if(faq.imageContent!=''){
                                faq.imageContent=JSON.parse(faq.imageContent);
                            }
                        });
                    }
                    else {
                        this.faqsPending = filter(this.faqs, {status: 'Pending', assignedUserId: this.authServie.getCurrentUser().userId});
                        this.faqsPending.forEach((faq) => {
                            
                            if(faq.imageContent!=''){
                                faq.imageContent=JSON.parse(faq.imageContent);
                            }
                        });
                    }
                });

        this.searchInput.valueChanges.pipe(
                debounceTime(300),
                distinctUntilChanged(),
            ).subscribe(searchText => {
                this.faqService.params.search = searchText;
                this.faqService.getFaqsAndCount()
                    .subscribe((res) => {
                        console.log(res)
                    });
            });
    }

    initData() {

    }

    ngOnDestroy()
    {
        this.onFaqsChangedSubscription.unsubscribe();
    }

    setStep(index: number)
    {
        this.step = index;
    }

    nextStep()
    {
        this.step++;
    }

    prevStep()
    {
        this.step--;
    }

    newFaq()
    {
        this.dialogRef = this.dialog.open(FaqFormComponent, {
            panelClass: 'faq-form-dialog',
            data      : {
                action: 'new'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((faq: any) => {
                if ( !faq ) return;
                this.loading = true; 
                this.faqService.createFaq(faq)
                    .subscribe((res) => {
                        this.msg.show('Faq created successfully', 'success');
                        this.loading = false;
                    }, err => {
                        this.msg.show('Error occurred creating a faq', 'error');
                        this.loading = false;
                    });
            });
    }

    updateFaq(faq)
    {
        this.dialogRef = this.dialog.open(FaqFormComponent, {
            panelClass: 'faq-form-dialog',
            data      : {
                action: 'edit',
                faq: new Faq(faq)
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((faq: Faq) => {
                if ( !faq ) return;
                this.loading = true; 
                this.faqService.updateFaq(faq)
                    .subscribe((res) => {
                        this.msg.show('Faq updated successfully', 'success');
                        this.loading = false;
                    }, err => {
                        this.msg.show('Error occurred updating the faq', 'error');
                        this.loading = false;
                    });
            });
    }

    publishFaq(faq)
    {
        this.loading = true; 
        this.faqService.updateFaqStatus({id: faq.id, status: 'Approved'})
            .subscribe((res) => {
                this.msg.show('Faq published successfully', 'success');
                this.loading = false;
            }, err => {
                this.msg.show('Error occurred publishing the faq', 'error');
                this.loading = false;
            });
    }
    
    clearSearch()
    {
        if (this.searchInput.value.length > 0)
            this.searchInput.setValue('');
    }

    /**
     * Delete Contact
     */
    deleteFaq(faq)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to remove?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.loading = true; 
                this.faqService.deleteFaq(faq)
                    .subscribe((res) => {
                        this.msg.show('Faq deleted successfully', 'success');
                        this.loading = false;
                    }, err => {
                        this.msg.show('Error occurred deleting the faq', 'error');
                        this.loading = false;
                    });
            }
            this.confirmDialogRef = null;
        });
    }
    openimage(image){
        this.dialog.open(ViewImageComponent, {
            panelClass: 'popup-notes-dialog',
            width: '60%',
            data:image          
          });
    }

}
