import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';

import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { checkEmpty } from 'app/utils/utils';
import { Mail } from 'app/models/mail';
import { map } from 'rxjs/operators';

@Injectable()
export class MailService implements Resolve<any>
{
    onMailsChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onMailCredentialsChanged: BehaviorSubject<any> = new BehaviorSubject(false);
    onCurrentMailChanged: BehaviorSubject<any> = new BehaviorSubject({});

    checkEmpty = checkEmpty;

    params = {
        userId : '',
        from : '',
        folder : '',
        clearCache : 0,
        search: '',
        page: 1,
        pageSize: 25
    }

    mails: Mail[] = [];
    currentMail: Mail;
    routeParams: any;
    mailCredentialsList: any[] = [];
    mailCache: any[] = [];
    constructor
    (
        private api: ApiService,
        private auth: AuthService
    )
    {
        
    }

    /**
     * Resolve
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {   
        this.routeParams = route.params;
        return this.getMailCredentials();
    }

    getMailCredentials()
    {
        return this.api.getUserEmailSetting(this.auth.getCurrentUser().userId).pipe(
            map((res: any) => {
                this.mailCredentialsList = res;
                if (checkEmpty(res)) {
                    this.onMailCredentialsChanged.next(false);
                    return res; 
                }
                else {
                    this.onMailCredentialsChanged.next(true);
                    return res;
                }
            })
        );
    }

    getEmails() {
        this.params.userId = this.auth.getCurrentUser().userId;
        return this.api.getEmails(this.params).pipe(
            map((res: any) => {
                this.mails = [];
                this.mails = res.data.map(mail => {
                    try {
                        // Parse invalid From address
                        const index = mail.from.indexOf('<');
                        if (index >0) {
                            mail.from = mail.from.slice(index);
                            mail.from = mail.from.slice(1,-1);
                        }
                        mail.from = mail.from.replace("'@' . ",'@');
                        // Parse To address
                        if (mail.to == false){
                            mail.to = [];
                        }
                        else{
                            if(typeof(mail.to) == 'string'){
				    mail.to = mail ?mail.to.split(',') : '';
				    mail.to = mail.to.map(to => {
					const index = to.indexOf('<');
					if (index >0) {
					    to = to.slice(index);
					    to = to.slice(1,-1);
					}
					to = to.replace("'@' . ",'@');
					return to.trim();
				    });                            
                            }
                        }
                        return new Mail(mail);
                    } catch (error) {
                        console.error(error);
                        return new Mail(mail);
                    }

                });
                this.onMailsChanged.next({mails:this.mails, total:res.grandTotal, error:res.error});

                if ( this.routeParams.mailId )
                {
                    this.setCurrentMail(this.routeParams.mailId);
                }
                else
                {
                    this.setCurrentMail(null);
                }
                return res;
            })
        );
    }

    setPagination(pe) {
        this.params.page = pe.pageIndex + 1;
        this.params.pageSize = pe.pageSize;
        return this.getEmails();
    }

    getAttachmentData(filename) {
        const params = {
            userId: this.auth.getCurrentUser().userId,
            uid: this.currentMail.uid,
            filename: filename
        }
        return this.api.getAttachmentData(params);
    }

    setCurrentMail(uid)
    {
        this.currentMail = this.mails.find(mail => {
            return mail.uid === uid;
        });

        this.onCurrentMailChanged.next(this.currentMail);
    }

    resetParams(){
        this.params = {
            userId : this.auth.getCurrentUser().userId,
            from : '',
            folder : '',
            clearCache : 0,
            search: '',
            page: 1,
            pageSize: 25
        }
    }
}
