import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

import { Activity } from 'app/models';

@Injectable()
export class ActivitiesService {

    onSelectionChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onActivitiesChanged: BehaviorSubject<Activity[]> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onSearchTextChanged: Subject<any> = new Subject();
    onActivityChanged: BehaviorSubject<string> = new BehaviorSubject('');
    activities: Activity[];


    searchText = '';
    _selection: string[] =[];

    payload = {
        offset: 0,
        limit: 50,
        order: '',
        orient: 'asc',
        term: {
            type: '',
            name: '',
            refId: '',
            refType: '',
            refName: '',
            assigned: '',
            dueDate: '',
            dateEntered: '',
            owner: '',
            status: '',
            priority: '',
            direction: '',
            phone: '',
            userId: ''
        }
    }



    searchPayload = {
        offset: 0,
        limit: 50,
        order: '',
        orient: 'asc',
        search: ''
    }

    viewMyItems = false;
    showCompleted = false;

    constructor(
        private api: ApiService,
        private authService: AuthService
    ){
        this.onSearchTextChanged.subscribe(searchText => {
            this.searchText = searchText;
            this.searchPayload.search = searchText;
            this.getTotalCount();
            this.getActivitiesList();
        });
    }

    /**
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
       this.resetParams();
       this.showCompleted = false;

        if ((route.queryParams.refType) && (route.queryParams.refType == 'Account' || route.queryParams.refType == 'Contact')) {
            this.payload.term.refId = route.queryParams.refId;
            this.payload.term.refType = route.queryParams.refType;
            this.payload.term.status = route.queryParams.status;
        }

        if (route.queryParams.refType && route.queryParams.refType == 'User'){
            this.payload.term.userId = route.queryParams.userId;
            this.payload.term.status = route.queryParams.status;
        }
        if (route.queryParams.status && route.queryParams.status == 'owned'){
            this.payload.term.status = "Pending";
            this.payload.term.owner = route.queryParams.owner;
        }

        return Promise.all([
            // this.getTotalCount(),
            // this.getActivitiesList()
        ]);
    }

    getTotalCount(): Promise<any>{ 
        return new Promise(
            (resolve, reject) => {
                const data = this.searchText != '' ? this.searchPayload : this.payload;
                this.api.post('/content/get-activity-count', data)
                    .subscribe((response: any) => {
                        this.onTotalCountChanged.next(response);
                        resolve(response);
                    },(err)=> reject(err));
            }
        );
    }

    getActivitiesList(): Promise<any> 
    {
        return new Promise(
            (resolve, reject) => {
                const data = this.searchText != '' ? this.searchPayload : this.payload;
                console.log('getActivitiesList', data)
                this.api.post('/content/get-activities', data)
                    .subscribe((response: any) => {
                        console.log("raw response", response);
                        this.activities = response.map(activity => {
                            let act = new Activity(activity);
                            if(activity["assignedType"] === "0"){
                                act['assignedName'] = "U: "+act['assignedName'];
                            }
                            else{
                                act['assignedName'] = "G: "+act['assignedName'];

                            }
                            return act;
                        });
                        console.log("this.activities", this.activities);
                        this.onActivitiesChanged.next(this.activities);
                        resolve(this.activities);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected activity by id
     * @param id
     */
    toggleSelected(id) 
    {
        if ( this._selection.length > 0 )
        {
            const index = this._selection.indexOf(id);

            if ( index !== -1 )
            {
                this._selection.splice(index, 1);
                this.onSelectionChanged.next(this._selection);

                return;
            }
        }

        this._selection.push(id);
        this.onSelectionChanged.next(this._selection);
    }

    toggleSelectAll() 
    {
        if ( this._selection.length === this.activities.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.activities.map(activity => activity.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    createActivity(activity: any) {
        return this.api.post('/content/create-activity', activity);
    }

    updateActivity(activity: Activity)
    {
        return this.api.post('/content/update-activity', activity.toObject());
    }

    deleteActivity(activityId)
    {
        return this.api.post('/content/delete-activity', { id: activityId });
    }

    deleteSelectedActivities()
    {
        return this.api.post('/content/delete-activity', { id: this._selection });
    }

    autocompleteUsers(name){
        return this.api.getUserAutocomplete(name);
    }
    
    autocompleteNotificationGroup(name){
        return this.api.autocompleteNotificationGroup(name);
    }

    autocompleteAccounts(name){
        return this.api.getCustomerAutocomplete(name);
    }

    autocompleteContacts(name, email = false){
        return this.api.getContactAutocomplete(name, email);
    }

    autocompleteOrders(name) {
        return this.api.getOrderAutocomplete(name);
    }

    autocompleteQuotes(name) {
        return this.api.getQuoteAutocomplete(name);
    }


    autocompleteProjects(name) {
        return this.api.getProjectAutocomplete(name);
    }

    autocompleteVendors(name) {
        return this.api.getVendorAutocomplete(name);
    }

    autocompleteLeads(name) {
        return this.api.getLeadsAutocomplete(name);
    }

    autocompleteArtworks(name) {
        return this.api.getArtworkcomplete(name);
    }
    autocompleteSourcing(name) {
        return this.api.getSourcingcomplete(name);
    }

    autocompleteOpportunities(name) {
        return this.api.getOpportunityAutocomplete(name);
    }

    autocompleteOpportunitiesByName(name) {
        return this.api.getOpportunityAutocompleteByName(name);
    }
    resetParams() {
        this.payload.term = {
            type: '',
            name: '',
            refId: '',
            refType: '',
            assigned: '',
            dueDate: '',
            dateEntered: '',
            owner: '',
            status: '',
            priority: '',
            direction: '',
            phone: '',
            userId: '',
            refName: ''
        };
        this.searchPayload.search = '';
    }
}
