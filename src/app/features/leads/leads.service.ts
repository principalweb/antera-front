import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';

import { Lead, LeadDetails } from '../../models';
import { ApiService } from '../../core/services/api.service';
import { SelectionService } from '../../core/services/selection.service';
import { AuthService } from 'app/core/services/auth.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable()
export class LeadsService implements Resolve<any>
{
    onLeadsChanged: BehaviorSubject<Lead[]> = new BehaviorSubject([]);
    onLeadsCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);

    params = {
        offset: 0,
        limit: 50,
        order: "firstName",
        orient: "asc",
        term: {
            name: '',
            title: '',
            referedBy: '',
            status: '',
            accountName: '',
            phoneWork: '',
            email: '',
            salesRep: '',
            dateCreated: '',
            createdBy: '',
            createdByName: '',
            salesRepId: '',
            contactId: ''
        },
        permUserId: ''
    };

    viewMyItems = false;
    constructor(
        private api: ApiService,
        private selection: SelectionService,
        private authService: AuthService
    ) { }

    /**
     * The Leads App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        this.resetParams();
        if (route.queryParams.refType && route.queryParams.refType == 'Account') {
            this.params.term.accountName = route.queryParams.assigned;
            this.params.term.status = route.queryParams.status;
        }

        if (route.queryParams.refType && route.queryParams.refType == 'User') {
            this.params.term.salesRep = route.queryParams.userName;
            this.params.term.status = route.queryParams.status;
        }

        if (route.queryParams.refType && route.queryParams.refType == 'Contact') {
            this.params.term.contactId = route.queryParams.assigned;
            this.params.term.status = route.queryParams.status;
        }

        return this.getLeadsAndCount();
    }

    getLeads() {
        this.params.permUserId = this.authService.getCurrentUser().userId;
        return this.api.getLeadsList(this.params).pipe(
            map((response: any) => {
                this.onLeadsChanged.next(response);
                return response;
            })
        );
    }

    getLeadsCount() {
        this.params.permUserId = this.authService.getCurrentUser().userId;
        return this.api.getLeadsCount(this.params).pipe(
            map((response: any) => {
                this.onLeadsCountChanged.next(response.count);
                return response;
            })
        );
    }

    getLeadsAndCount() {
        return forkJoin([
            this.getLeads(),
            this.getLeadsCount()
        ]);
    }

    createLead(lead: LeadDetails) {
        return this.api.createLead(lead.toObject()).pipe(
            switchMap(() => this.getLeads()),
        );
    }

    updateLead(lead: LeadDetails) {
        return this.api.updateLead(lead.toObject()).pipe(
            switchMap(() => this.getLeads())
        );
    }

    deleteLead(id) {
        return this.api.deleteLeads([id]).pipe(
            switchMap(() => this.getLeadsAndCount())
        );
    }

    deleteSelectedLeads() {
        return this.api.deleteLeads(this.selection.selectedIds).pipe(
            switchMap(() => this.getLeadsAndCount())
        );
    }

    setPagination(pe) {
        this.params.offset = pe.pageIndex;
        this.params.limit = pe.pageSize;

        return this.getLeads();
    }

    sort(se) {
        this.params.order = se.active;
        this.params.orient = se.direction;

        return this.getLeads();
    }

    filter(term) {
        this.params.term = term;

        return this.getLeadsAndCount();
    }

    filterViewMyItem(userId) {
        if (this.viewMyItems)
            this.params.term.salesRepId = userId;
        else
            this.params.term.salesRepId = '';
        return this.getLeadsAndCount();
    }

    search(text) {

    }

    resetParams() {
        this.params.term = {
            name: '',
            title: '',
            referedBy: '',
            status: '',
            accountName: '',
            phoneWork: '',
            email: '',
            salesRep: '',
            dateCreated: '',
            createdBy: '',
            createdByName: '',
            salesRepId: '',
            contactId: ''
        }
    }
}
