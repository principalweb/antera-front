import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject, forkJoin } from 'rxjs';
import { findIndex, find } from 'lodash';
import * as moment from 'moment';
import { AuthService } from 'app/core/services/auth.service';
import { Source, SourceDetails } from 'app/models/source';
import { ApiService } from 'app/core/services/api.service';

@Injectable()
export class SourceResponseService implements Resolve<any>
{
    constructor(
        private api: ApiService,
        private authService: AuthService
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let { source, factory } = route.params; 
        return forkJoin([
            this.getLogo(),
            this.getAccountById(factory),
            this.getSourcingDetailsBySourcingId(source),
        ]);
    }


    getLogo() {
        return this.api.getLogo();
    }

    getAccountById(id) {
        return this.api.getAccountDetails(id);
    }

    getSourcingDetailsBySourcingId(id) {
        return this.api.getSourcingDetailsBySourcingId(id);
    }


    createSourcingSubmission(submission) {
        return this.api.createSourcingSubmission(submission);
    }

    updateSourcingSubmission(submission) {
        return this.api.updateSourcingSubmission(submission);
    }
}
