import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';
import { FuseUtils } from '@fuse/utils';
import { Project } from './project.model';
import { MessageService } from 'app/core/services/message.service';

const searchFields = [
    'clientName', 'hostName', 'points', 'distributor'
];

@Injectable()
export class ProjectsService implements Resolve<any>
{
    onStoresChanged: BehaviorSubject<Project[]>;
    onSelectionChanged: BehaviorSubject<string[]>;
    // onUserDataChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSearchTextChanged: Subject<any> = new Subject();
    // onFilterChanged: Subject<any> = new Subject();

    projects: Project[];
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

            this.getProjects().then(console.log);
        });
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        return this.getProjects();
    }

    getProjects(): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.http.get('api/projects')
                    .subscribe((response: Project[]) => {

                        this.projects = response;

                        if ( this._searchText && this._searchText !== '' )
                        {
                            this.projects = FuseUtils.filterFieldsByString(
                                this.projects, this._searchText, searchFields
                            );
                        }

                        this.onStoresChanged.next(this.projects);
                        resolve(this.projects);
                    }, reject);
            }
        );
    }

    /**
     * Toggle selected project by id
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
        if ( this._selection.length === this.projects.length) {
            this.deselectAll();
        } else {
            this.selectAll();
        }
    }

    selectAll()
    {
        this._selection = this.projects.map(ws => ws.id);
        this.onSelectionChanged.next(this._selection);
    }

    deselectAll()
    {
        this._selection = [];
        this.onSelectionChanged.next(this._selection);
    }

    updateProject(ws: Project)
    {
        return new Promise((resolve, reject) => {

            this.http.post('api/projects/' + ws.id, {...ws})
                .subscribe(response => {
                    this.getProjects().then(resolve, reject);
                });
        });
    }

    deleteProject(ws)
    {
        const accountIndex = this.projects.indexOf(ws);
        this.projects.splice(accountIndex, 1);
        this.onStoresChanged.next(this.projects);
        this.msg.show('This item has been moved to the Recycle Bin','success');
    }

    deleteSelectedProjects()
    {
        this.projects = this.projects.filter(
            ws => this._selection.indexOf(ws.id) < 0
        );

        this.deselectAll();
        this.onStoresChanged.next(this.projects);
        this.msg.show('This item has been moved to the Recycle Bin','success');
    }
}
