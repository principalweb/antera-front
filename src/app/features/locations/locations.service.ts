import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';
import { FuseUtils } from '@fuse/utils';
import { Location } from './location.model';
import { MessageService } from 'app/core/services/message.service';

import { filter, each, sortBy, reverse } from 'lodash';
import { tap } from 'rxjs/operators';

const searchFields = [
    'clientName', 'hostName', 'points', 'distributor'
];

@Injectable()
export class LocationsService implements Resolve<any>
{
    onStoresChanged: BehaviorSubject<Location[]>;
    onTotalCountChanged: BehaviorSubject<Number>;
    onSelectionChanged: BehaviorSubject<string[]>;
    // onUserDataChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSearchTextChanged: Subject<any> = new Subject();
    onClearFilters: Subject<any> = new Subject();

    locations: Location[];
    // user: any;
    // selectedAccounts: string[] = [];

    private _searchText: string;
    private _selection: string[];
    // filterBy: string;

    params = {
        offset: 0,
        limit: 10,
        order: '',
        orient: 'asc',
        term: {
            companyName: '',
            deliveryContact: '',
            type: '',
            shipCity: '',
            shipState: '',
            phone: '',
        }
    }

    constructor(private http: HttpClient, private msg: MessageService)
    {
        this.onStoresChanged = new BehaviorSubject([]);
        this.onTotalCountChanged = new BehaviorSubject(0);
        this.onSelectionChanged = new BehaviorSubject([]);
        this._searchText = '';
        this._selection = [];

        // this.onSearchTextChanged.subscribe(val => {
        //     this._searchText = val;

        //     this.getLocations().then(console.log);
        // });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return this.getLocations();
    }

    getLocations(): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.get('api/locations')
                    .subscribe((response: Location[]) => {
                        this.locations = response;
                        this.filterLocations();
                        resolve(this.onStoresChanged.value);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected location by id
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
        if ( this._selection.length === this.locations.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.locations.map(ws => ws.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    createLocation(ws: Location) {
        return this.http.post('/protected/content/create-location', ws).pipe(
            tap((res) => this.getLocations())
        );
    }

    updateLocation(ws: Location)
    {
        return this.http.post('/protected/content/update-location', ws).pipe(
            tap((res) => this.getLocations())
        );
    }

    deleteLocation(ws)
    {
        const accountIndex = this.locations.indexOf(ws);
        this.locations.splice(accountIndex, 1);
        this.filterLocations();
        this.msg.show('This item has been moved to the Recycle Bin','success');
    }

    deleteSelectedLocations()
    {
        this.locations = this.locations.filter(
            ws => this._selection.indexOf(ws.id) < 0
        );

        this.deselectAll();
        this.filterLocations();
        this.msg.show('These items have been moved to the Recycle Bin','success');
    }

    filterLocations() {
        let filtered = filter(this.locations, location => {
            let cond = true;
            each(this.params.term, (v, k) => {
                if (!v || !location[k]) return;

                v = v.toLowerCase();
                if (('' + location[k]).toLowerCase().indexOf(v) < 0) {
                    cond = false;
                }
            });
            return cond;
        });

        this.onTotalCountChanged.next(filtered.length);

        switch(this.params.orient) {
            case "asc":
                filtered = sortBy(filtered, [this.params.order]);
                break;

            case "desc":
                filtered = reverse(sortBy(filtered, [this.params.order]));
                break;
        }

        const paged = filtered.slice(
            this.params.offset * this.params.limit,
            (this.params.offset + 1) * this.params.limit
        );

        this.onStoresChanged.next(paged);
    }

    sort(se) {
        this.params.order = se.active;
        this.params.orient = se.direction;
        this.filterLocations();
    }

    paginate(pe) {
        this.params.offset = pe.pageIndex;
        this.params.limit = pe.pageSize;
        this.filterLocations();
    }

    resetFilters() {
        this.params.term = {
            companyName: '',
            deliveryContact: '',
            type: '',
            shipCity: '',
            shipState: '',
            phone: '',
        };
        this.params.offset = 0;

        this.onClearFilters.next();
        this.filterLocations();
    }
}
