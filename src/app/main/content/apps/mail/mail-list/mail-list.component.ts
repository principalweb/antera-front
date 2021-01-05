import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription , Observable, interval} from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { MailService } from '../mail.service';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core';
import { Mail } from 'app/models/mail';

@Component({
    selector   : 'fuse-mail-list',
    templateUrl: './mail-list.component.html',
    styleUrls  : ['./mail-list.component.scss'],
    animations : fuseAnimations
})
export class FuseMailListComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) paginator: MatPaginator;

    mails: Mail[] = [];
    currentMail: Mail;
    totalMails: Mail[] = [];

    onMailsChanged: Subscription;
    onCurrentMailChanged: Subscription;
    timerSubscription: Subscription;
    totalCount = 0;
    errorMsg = '';

    loading = false;
    loaded = () => {
        this.loading = false;
    };

    constructor(
        private mailService: MailService,
    )
    {

    }


    ngOnInit()
    { 
        // Subscribe to update mails on changes
        this.onMailsChanged =
            this.mailService.onMailsChanged
                .subscribe((res: any)=> {
                    this.mails = res.mails;
                    this.totalCount = res.total;
                    this.errorMsg = res.error;
                });    
                
        // Subscribe to update current mail on changes
        this.onCurrentMailChanged =
            this.mailService.onCurrentMailChanged
                .subscribe(currentMail => {
                    if ( !currentMail )
                    {
                        // Set the current mail id to null to deselect the current mail
                        this.currentMail = null;
                    }
                    else
                    {
                        this.currentMail = currentMail;
                    }
                });
        
        // Check latest email updates after every XX seconds 
        this.timerSubscription = interval(120*1000)
            .subscribe(() => {}
                // this.mailService.checkLatestEmailUpdates().then((newEmailCount) => {
                //     if (newEmailCount > 0) 
                //     {
                //         this.mailService.refreshMails();
                //     }
                // }).catch((err) => {
                //     console.error(err);
                // })
            );

    }

    ngOnDestroy()
    {
        this.onMailsChanged.unsubscribe();
        this.onCurrentMailChanged.unsubscribe();
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        } 
    }

    /**
     * Read mail
     * @param mailId
     */
    readMail(mailId)
    {
        // Set current mail
        this.mailService.setCurrentMail(mailId);
    }

    paginate(ev) {
        this.loading = true;
        this.mailService.setPagination(ev)
            .subscribe(this.loaded, this.loaded);
    }
}
