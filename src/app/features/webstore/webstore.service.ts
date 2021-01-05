import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';
import { FuseUtils } from '@fuse/utils';
import { Webstore } from './webstore.model';
import { MessageService } from 'app/core/services/message.service';

const searchFields = [
    'clientName', 'hostName', 'points', 'distributor'
];

@Injectable()
export class WebstoreService implements Resolve<any>
{
    onStoresChanged: BehaviorSubject<Webstore[]>;
    onSelectionChanged: BehaviorSubject<string[]>;
    // onUserDataChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSearchTextChanged: Subject<any> = new Subject();
    // onFilterChanged: Subject<any> = new Subject();

    webstores: Webstore[];
    // user: any;
    // selectedAccounts: string[] = [];

    private _searchText: string;
    private _selection: string[];
    // filterBy: string;

    constructor(private http: HttpClient, private msg: MessageService)
    {
        this.onStoresChanged = new BehaviorSubject([]);
        this.onSelectionChanged = new BehaviorSubject([]);
        this._searchText = '';
        this._selection = [];

        this.onSearchTextChanged.subscribe(val => {
            this._searchText = val;

            this.getWebstores().then(console.log);
        });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return this.getWebstores();
    }

    getWebstores(): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.get('api/webstore')
                    .subscribe((response: Webstore[]) => {

                        this.webstores = response;

                        if ( this._searchText && this._searchText !== '' )
                        {
                            this.webstores = FuseUtils.filterFieldsByString(
                                this.webstores, this._searchText, searchFields
                            );
                        }

                        this.onStoresChanged.next(this.webstores);
                        resolve(this.webstores);
                    }, reject);
            }
        );
    }

    toggleEnabled(ws: Webstore) {
        const ws1 = new Webstore({
            ...ws,
            enabled: !ws.enabled
        });

        return new Promise((resolve, reject) => {

            this.http.post('api/webstore/' + ws.id, ws1)
                .subscribe(response => {
                    const id = this.webstores.indexOf(ws);
                    this.webstores[id] = ws1;
                });
        });
    }

    /**
     * Toggle selected webstore by id
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
        if ( this._selection.length === this.webstores.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.webstores.map(ws => ws.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    updateWebstore(ws: Webstore)
    {
        return new Promise((resolve, reject) => {

            this.http.post('api/webstore/' + ws.id, {...ws})
                .subscribe(response => {
                    this.getWebstores().then(resolve, reject);
                });
        });
    }

    deleteWebstore(ws)
    {
        const accountIndex = this.webstores.indexOf(ws);
        this.webstores.splice(accountIndex, 1);
        this.onStoresChanged.next(this.webstores);
        this.msg.show('This item has been moved to the Recycle Bin','success');
    }

    deleteSelectedWebstores()
    {
        this.webstores = this.webstores.filter(
            ws => this._selection.indexOf(ws.id) < 0
        );

        this.deselectAll();
        this.onStoresChanged.next(this.webstores);
        this.msg.show('This items have been moved to the Recycle Bin','success');
    }
}
