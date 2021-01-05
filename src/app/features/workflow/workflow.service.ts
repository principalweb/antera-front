import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';

import { FuseUtils } from '@fuse/utils';

import { Workflow } from './workflow.model';

const searchFields = [
    'orderNumber', 'identity', 'account', 'vendor'
];

@Injectable()
export class WorkflowService implements Resolve<any>
{
    onWorkFlowsChanged: BehaviorSubject<Workflow[]>;
    onSelectionChanged: BehaviorSubject<string[]>;
    onSearchTextChanged: Subject<any> = new Subject();

    workflows: Workflow[];

    private _searchText: string;
    private _selection: string[];
    // filterBy: string;

    constructor(private http: HttpClient)
    {
        this.onWorkFlowsChanged = new BehaviorSubject([]);
        this.onSelectionChanged = new BehaviorSubject([]);
        this._searchText = '';
        this._selection = [];

        this.onSearchTextChanged.subscribe(val => {
            this._searchText = val;

            this.getWorkflows().then(console.log);
        });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return this.getWorkflows();
    }

    getWorkflows(): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.get('api/workflow')
                    .subscribe((response: Workflow[]) => {

                        this.workflows = response;

                        if ( this._searchText && this._searchText !== '' )
                        {
                            this.workflows = FuseUtils.filterFieldsByString(
                                this.workflows, this._searchText, searchFields
                            );
                        }

                        this.onWorkFlowsChanged.next(this.workflows);
                        resolve(this.workflows);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected Workflow by id
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
        if ( this._selection.length === this.workflows.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.workflows.map(wk => wk.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    updateWorkflow(wk: Workflow)
    {
        return new Promise((resolve, reject) => {

            this.http.post('api/Workflow/' + wk.id, {...wk})
                .subscribe(response => {
                    this.getWorkflows().then(resolve, reject);
                });
        });
    }

    deleteWorkflow(wk)
    {
        const flowIndex = this.workflows.indexOf(wk);
        this.workflows.splice(flowIndex, 1);
        this.onWorkFlowsChanged.next(this.workflows);
    }

    deleteSelectedWorkflows()
    {
        this.workflows = this.workflows.filter(
            wk => this._selection.indexOf(wk.id) < 0
        );

        this.deselectAll();
        this.onWorkFlowsChanged.next(this.workflows);
    }
}
