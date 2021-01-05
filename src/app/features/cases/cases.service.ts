import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';
import { FuseUtils } from '@fuse/utils';
import { Case } from '../../models';
import { MessageService } from 'app/core/services/message.service';

const searchFields = [
    'clientName', 'hostName', 'points', 'distributor'
];

@Injectable()
export class CasesService implements Resolve<any>
{
    onCasesChanged: BehaviorSubject<Case[]>;
    onSelectionChanged: BehaviorSubject<string[]>;
    // onUserDataChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSearchTextChanged: Subject<any> = new Subject();
    // onFilterChanged: Subject<any> = new Subject();

    cases: Case[];
    // user: any;
    // selectedAccounts: string[] = [];

    private _searchText: string;
    private _selection: string[];
    // filterBy: string;

    constructor(private http: HttpClient, private msg: MessageService)
    {
        this.onCasesChanged = new BehaviorSubject([]);
        this.onSelectionChanged = new BehaviorSubject([]);
        this._searchText = '';
        this._selection = [];

        this.onSearchTextChanged.subscribe(val => {
            this._searchText = val;

            this.getCases().then(console.log);
        });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return this.getCases();
    }

    getCases(): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.get('api/cases')
                    .subscribe((response: Case[]) => {

                        this.cases = response;

                        if ( this._searchText && this._searchText !== '' )
                        {
                            this.cases = FuseUtils.filterFieldsByString(
                                this.cases, this._searchText, searchFields
                            );
                        }

                        this.onCasesChanged.next(this.cases);
                        resolve(this.cases);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected case by id
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
        if ( this._selection.length === this.cases.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.cases.map(ws => ws.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    updateCase(ws: Case)
    {
        return new Promise((resolve, reject) => {

            this.http.post('api/cases/' + ws.id, {...ws})
                .subscribe(response => {
                    this.getCases().then(resolve, reject);
                });
        });
    }

    deleteCase(ws)
    {
        const accountIndex = this.cases.indexOf(ws);
        this.cases.splice(accountIndex, 1);
        this.onCasesChanged.next(this.cases);
        this.msg.show('This item has been moved to the Recycle Bin','success')
    }

    deleteSelectedCases()
    {
        this.cases = this.cases.filter(
            ws => this._selection.indexOf(ws.id) < 0
        );

        this.deselectAll();
        this.onCasesChanged.next(this.cases);
        this.msg.show('These items have been moved to the Recycle Bin','success')
    }
}
