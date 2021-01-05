import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable ,  BehaviorSubject ,  Subject } from 'rxjs';

//import { User } from './users.model';

import { UserListItem } from 'app/models';
//import { User } from 'app/models';
import { FuseUtils } from '@fuse/utils';

import { ApiService } from '../../core/services/api.service';
import { MessageService } from '../../core/services/message.service';

const searchFields = [
    '', ''
];

@Injectable()
export class UsersService implements Resolve<any>
{
    onUsersChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSelectedUsersChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onSearchTextChanged: Subject<any> = new Subject();
    onFilterChanged: Subject<any> = new Subject();
    onTotalCountChanged: BehaviorSubject<any> = new BehaviorSubject(0);
    onCorporateIdentityChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    users: UserListItem[];
//    user: any;
    selectedUsers: string[] = [];

    private searchText: string;
    filterBy: string;

    page: any = {
        pageSize: 50,
        pageIndex: 0
    };
    sort: any = {active: "dateCreated", direction: "desc"};
    term: any = {};

    constructor(private api: ApiService, private http: HttpClient, private msg: MessageService)
    {
        this.searchText = '';
        this.onSearchTextChanged.subscribe(searchText => {
            this.searchText = searchText;

            this.getUserCount().then(console.log);
            this.getUsersList().then(console.log);
        });
    }

    /**
     * The Users App Main Resolver
     * @param {ActivatedRouteSnapshot} route
     * @param {RouterStateSnapshot} state
     * @returns {Observable<any> | Promise<any> | any}
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any
    {
        const searchText = route.queryParamMap.get('search');
        this.searchText = searchText ? searchText : '';

        const id = route.paramMap.get('id');

        let list;
        
               
        if (this.users && this.users.length > 0) { // Reset settings with first entry
            this.page = {
                pageSize: 50,
                pageIndex: 0
            };
            this.sort = {active: "dateCreated", direction: "desc"};
            this.term = {};
        }

        localStorage.getItem("users_userName") !== null ? Object.assign(this.term,{userName:localStorage.getItem("users_userName")}) : "";
        localStorage.getItem("users_fullName") !== null ? Object.assign(this.term,{fullName:localStorage.getItem("users_fullName")}) : "";
        localStorage.getItem("users_userEmail") !== null ? Object.assign(this.term,{userEmail:localStorage.getItem("users_userEmail")}) : "";
        localStorage.getItem("users_phone") !== null ? Object.assign(this.term,{phone:localStorage.getItem("users_phone")}) : "";
        localStorage.getItem("users_userStatus") !== null ? Object.assign(this.term,{userStatus:localStorage.getItem("users_userStatus")}) : "";
        

        list = [
            this.getUsersList(),
            this.getUserCount(),
        ];

        if (id) {
            list.push(this.getUserDetails(id));
        }
/*        return new Promise((resolve, reject) => {
            Promise.all(list).then(
                () => {
                    resolve();
                },
                reject
            );
        });*/

        return Promise.all(list);
    }
    cognitoPushUser(): Promise<any> {
        return new Promise((resolve, reject) => {

            this.api.put('/cognito/push-user', null)
                .subscribe((list: any) => {
                    console.log(list);
                    resolve(list);
                }, err => resolve(err));
        });
    }
    getUsersList(isFilterRequired = false): Promise<any> {
        return new Promise((resolve, reject) => {
                let data = {};
                if (isFilterRequired){
                    data = {
                        offset: this.page.pageIndex,
                        limit: this.page.pageSize,
                        order: this.sort.active,
                        orient: this.sort.direction,
                        term: this.term
                    };
                } else {
                    data = {
                        offset: this.page.pageIndex,
                        limit: this.page.pageSize,
                        order: this.sort.active,
                        orient: this.sort.direction,
                        search: this.searchText,
                        term: this.term
                    };
                }

            this.api.post('/content/get-users-list', data)
                .subscribe((list: any) => {
                    this.users  = list;
                    this.users = this.users.map(user => {
                        return new UserListItem(user);
                    });
                    this.onUsersChanged.next(this.users);
                    resolve(this.users);
                }, err => reject(err));
        });
    }

    getCorporateIdentity(): Promise<any> {
        return new Promise(
            (resolve, reject) => {
                this.http.get('/protected/content/get-corporate-identity')
                    .subscribe((response: any[]) => {
                        this.onCorporateIdentityChanged.next(response);
                        resolve(response);
                    }, reject);
            }
        );
    }

    getUserCount(isFilterRequired = false): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                let data = isFilterRequired? { term: this.term }:{ term: this.term,search: this.searchText};

                this.api.post('/content/get-user-count', data)
                    .subscribe((response: any) => {

                        this.onTotalCountChanged.next(response.count);

                        resolve(response.count);
                    }, reject);
            }
        );
    }

    createUser(user) {
        return this.api.post('/content/create-user', user);
    }

    deleteUsers(ids) {
        return this.api.post('/content/delete-users', {ids: ids});
    }

    updateUser(user)
    {
        return this.api.post('/content/update-user', user);
    }

    getUserDetails(id): Promise<any>
    {
        return new Promise(
            (resolve, reject) => {
                this.api.post('/content/get-user-details', {id})
                    .subscribe(
                        (response: any) => {
                            resolve(response);
                        },
                        reject
                    );
            }
        )
    }

    /**
     * Toggle selected contact by id
     * @param id
     */
    toggleSelectedUser(id)
    {
        // First, check if we already have that todo as selected...
        if ( this.selectedUsers.length > 0 )
        {
            const index = this.selectedUsers.indexOf(id);

            if ( index !== -1 )
            {
                this.selectedUsers.splice(index, 1);

                // Trigger the next event
                this.onSelectedUsersChanged.next(this.selectedUsers);

                // Return
                return;
            }
        }

        // If we don't have it, push as selected
        this.selectedUsers.push(id);

        // Trigger the next event
        this.onSelectedUsersChanged.next(this.selectedUsers);
    }

    /**
     * Toggle select all
     */
    toggleSelectAll()
    {
        if ( this.selectedUsers.length === this.users.length )
        {
            this.deselectUsers();
        }
        else
        {
            this.selectUsers();
        }
    }

    selectUsers(filterParameter?, filterValue?)
    {
        this.selectedUsers = [];

        // If there is no filter, select all todos
        if ( filterParameter === undefined || filterValue === undefined )
        {
            this.selectedUsers = [];
            this.users.map(user => {
                this.selectedUsers.push(user.id);
            });
        }
        else
        {
        }

        // Trigger the next event
        this.onSelectedUsersChanged.next(this.selectedUsers);
    }

    deselectUsers()
    {
        this.selectedUsers = [];

        // Trigger the next event
        this.onSelectedUsersChanged.next(this.selectedUsers);
    }

    autocompleteUsers(name){
        return this.api.getUserAutocomplete(name);
    }

}
