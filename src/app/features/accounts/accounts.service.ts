import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { findIndex } from 'lodash';

import { Account, Contact, Location } from '../../models';
import { ApiService } from '../../core/services/api.service';
import { MessageService } from '../../core/services/message.service';
import { SelectionService } from '../../core/services/selection.service';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class AccountsService {
    onAccountsChanged: BehaviorSubject<any> = new BehaviorSubject([]);
    onTotalCountChanged: BehaviorSubject<number> = new BehaviorSubject(0);
    onContactsChanged = new BehaviorSubject([]);
    onContactsCountChanged = new BehaviorSubject(0);
    onSearchTextChanged: Subject<any> = new Subject();
    onFilterValueChanged: Subject<any> = new Subject();
    onAccountStatsChanged: BehaviorSubject<any> = new BehaviorSubject({});
    onDropdownOptionsForAccountChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onTimezonesDropdownChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onDisplayMenuChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    onModuleFieldsChanged: BehaviorSubject<any[]> = new BehaviorSubject([]);
    adminFeeEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);


    onLocationsChanged = new BehaviorSubject([]);
    onLocationsCountChanged = new BehaviorSubject(0);

    accounts: Account[] = [];
    orderType = '';
    currentAccount: Account;
    orderContact: Contact;
    searchText = '';

    contactTerm: any = {};

    payload = {
        offset: 0,
        limit: 50,
        order: "",
        orient: "asc",
        term: {
            accountName: '',
            partnerType: '',
            billState: '',
            phone: '',
            salesRep: '',
            salesRepId: '',
            parentId: '',
            rating: '',
            dateCreated: ''
        },
        myViewItems: false,
        permUserId: ''
    };

    searchPayload = {
        offset: 0,
        limit: 50,
        order: "",
        orient: "asc",
        search: '',
        term: {
            accountName: '',
            partnerType: '',
            billState: '',
            phone: '',
            salesRep: '',
            salesRepId: '',
            parentId: '',
            rating: '',
            dateCreated: ''
        },
        type: true,
        completed: false,
        permUserId: ''
    }
    locationTerm: any;

    constructor(
        private api: ApiService,
        private msg: MessageService,
        private selection: SelectionService,
        private authService: AuthService
    ) {

        this.onSearchTextChanged.subscribe(searchText => {
            this.searchText = searchText;
            this.searchPayload.search = searchText;
            this.getAccounts();
            this.getAccountsCount();
        });
    }

    getAccountsCount(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.searchText = (this.searchText) ? this.searchText : '';
            let data = (this.searchText != '' ? this.searchPayload : this.payload);
            data.permUserId = this.authService.getCurrentUser().userId;

            this.api.post('/content/get-account-count', data)
                .subscribe((res: any) => {
                    this.onTotalCountChanged.next(res.count);
                    resolve(res.count);
                }, (err) => reject(err));
        });
    }

    getAccounts(): Promise<any> {
        return new Promise((resolve, reject) => {            
            let data = (this.searchText != '' ? this.searchPayload : this.payload);
            data.permUserId = this.authService.getCurrentUser().userId;
            
            data.term.accountName = localStorage.getItem('accounts_accountName') !== null ? localStorage.getItem('accounts_accountName') : ""
            data.term.partnerType = localStorage.getItem('accounts_partnerType') !== null ? localStorage.getItem('accounts_partnerType') : ""
            data.term.billState = localStorage.getItem('accounts_billState') !== null ? localStorage.getItem('accounts_billState') : ""
            data.term.phone = localStorage.getItem('accounts_phone') !== null ? localStorage.getItem('accounts_phone') : ""
            data.term.salesRep = localStorage.getItem('accounts_salesRep') !== null ? localStorage.getItem('accounts_salesRep') : ""
            
            this.api.post('/content/get-account-list', data)
                .subscribe((list: Account[]) => {
                    this.accounts = list;
                    this.onAccountsChanged.next(list);
                    resolve(list);
                }, err => reject(err));

        });
    }

    getTotalCountByPartnerType(partnerType) {
        return this.api.post('/content/get-account-count', {
            term: { partnerType: partnerType }
        })
            .toPromise()
            .then((res: any) => {
                return Promise.resolve(res.count);
            });
    }

    getAccountDetail(id) {
        return this.api.post('/content/get-account-details', { id }).toPromise();
    }

    getAccountAwsFilesLocation(id) {
        const data = {
            accountId: id,
        };
        return this.api.post('/content/get-account-aws-files-location', data).toPromise();
    }

    checkAdminFeeEnabled(){
        console.log("check admin fee running");
        this.api.getAdvanceSystemConfig({ module: 'Orders', setting: 'enableAdminFee' }).subscribe((res: any) => {
            if (res.value && res.value == 1) {
                this.adminFeeEnabled.next(true);
            } else {
                this.adminFeeEnabled.next(false);
            }
        })
    }

    addAccount(account) {
        delete account.id;
        let req = {
            data: account,
            permUserId: this.authService.getCurrentUser().userId
        }

        return this.api.post('/content/create-account', req).pipe(
            map((response: CreateAccountResponseType) => {
                if (response.status === 'success') {
                    this.accounts.push(response.extra);
                    return response
                }

                this.msg.show(response.msg, 'error');
                return of({});
            })
        );
    }

    updateAccount(account) {
        console.log('account', account);
        return this.api.post('/content/update-account-details', account).pipe(
            map((response: any) => {
                if (response.status === 'success') {
                    const idx = findIndex(this.accounts, { id: account.id });
                    this.accounts.splice(idx, 1, response.extra);
                    this.onAccountsChanged.next(this.accounts);
                } else {
                    this.msg.show(response[0].msg, 'error');
                }

                return response;
            })
        );
    }

    deleteAccount(account) {

        return new Promise((resolve, reject) => {
            this.api.deleteAccounts([account.id])
                .subscribe((response: any) => {
                    resolve(response);
                }, (err) => reject(err));
        });

    }

    deleteSelectedAccounts(): Promise<any> {

        const ids = this.selection.selectedIds;
        return new Promise((resolve, reject) => {
            this.api.deleteAccounts(ids)
                .subscribe((response: any) => {
                    resolve(response);
                }, (err) => reject(err));
        });
    }

    createLocation(ws: Location) {
        return this.api.post('/content/create-location', ws);
    }

    deleteLocation(ws: Location) {
        return this.api.post('/content/delete-locations', { ids: [ws.id] });
    }

    updateLocation(ws: Location) {
        return this.api.post('/content/update-location', ws);
    }

    getLocations(accId = "", offset = 0, limit = 10, order = 'date_entered', orient = 'asc'): Promise<any> {
        const data = {
            offset,
            limit,
            order,
            orient,
            accountId: accId,
            term: this.locationTerm,
            permUserId: this.authService.getCurrentUser().userId

        };
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-locations-for-account', data)
                .subscribe((response: Location[]) => {
                    this.onLocationsChanged.next(response);
                    resolve(response);
                });
        });
    }

    getLocationsCount(accId = "", offset = 0, limit = 10, order = 'date_entered', orient = 'asc'): Promise<any> {
        const data = {
            offset,
            limit,
            order,
            orient,
            accountId: accId,
            term: this.locationTerm,
            permUserId: this.authService.getCurrentUser().userId
        };
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-locations-count-for-account', data)
                .subscribe((response: any) => {
                    this.onLocationsCountChanged.next(response.count);
                    resolve(response);
                });
        });
    }

    getContacts(accId = "", offset = 0, limit = 10, order = '', orient = 'asc'): Promise<any> {
        const data = {
            offset,
            limit,
            order,
            orient,
            accountId: accId,
            term: this.contactTerm,
            permUserId: this.authService.getCurrentUser().userId

        };

        return new Promise((resolve, reject) => {
            this.api.post('/content/get-related-contacts', data)
                .subscribe((response: Contact[]) => {
                    this.onContactsChanged.next(response);
                    resolve(response);
                });
        });
    }

    getContactsCount(accId = "", offset = 0, limit = 10, order = '', orient = 'asc'): Promise<any> {
        const data = {
            offset,
            limit,
            order,
            orient,
            accountId: accId,
            term: this.contactTerm,
            permUserId: this.authService.getCurrentUser().userId

        };

        return new Promise((resolve, reject) => {
            this.api.post('/content/get-related-contacts-count', data)
                .subscribe((response: any) => {
                    this.onContactsCountChanged.next(response.count);
                    resolve(response.count);
                });
        });
    }

    getContactDetails(id): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-contact-details', { id })
                .subscribe((response: any) => {
                    resolve(response);
                });
        });
    }

    setOrderType(type) {
        this.orderType = type;
    }

    setCurrentAccount(account) {
        this.currentAccount = account;
    }

    setOrderContact(contact) {
        this.orderContact = contact;
    }

    autocompleteUsers(name) {
        return this.api.getUserAutocomplete(name);
    }

    getAccountStats(accountId) {
        const data = { id: accountId }
        return new Promise((resolve, reject) => {
            this.api.post('/content/get-account-stats', data)
                .subscribe((response: any) => {
                    this.onAccountStatsChanged.next(response);
                    resolve(response);
                }, err => reject(err));
        });
    }

    getDropdownOptionsForAccount(options) {
        return new Promise((resolve, reject) => {
            this.api.getDropdownOptions({ dropdown: options })
                .subscribe((response: any[]) => {
                    this.onDropdownOptionsForAccountChanged.next(response);
                    resolve(response);
                }, err => reject(err));
        });
    }

    getTimezonesDropdown() {
        return new Promise((resolve, reject) => {
            this.api.getTimeZonesDropdown()
                .subscribe((response: any[]) => {
                    this.onTimezonesDropdownChanged.next(response);
                    resolve(response);
                }, err => reject(err));
        });
    }

    getDisplayMenu(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/content/get-display-menu')
                .subscribe((list: any[]) => {
                    this.onDisplayMenuChanged.next(list);
                    resolve(list);
                }, reject);
        });
    }

    getModuleFields() {
        const accountModuleFieldParams =
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module: 'Accounts' }
        }

        return this.api.getFieldsList(accountModuleFieldParams)
            .subscribe((response: any) => {
                this.onModuleFieldsChanged.next(
                    response.map(moduleField =>
                        new ModuleField(moduleField)
                    )
                );
                return response;
            });
    }

    clearFilters() {
        this.payload.term = {
            accountName: '',
            partnerType: '',
            billState: '',
            phone: '',
            salesRep: '',
            dateCreated: '',
            parentId: '',
            rating: '',
            salesRepId: ''
        };
        this.payload.myViewItems = false;
        this.searchPayload.search = '';
    }

    resetParams() {
        this.payload = {
            offset: 0,
            limit: 50,
            order: "",
            orient: "asc",
            term: {
                accountName: '',
                partnerType: '',
                billState: '',
                phone: '',
                salesRep: '',
                salesRepId: '',
                parentId: '',
                rating: '',
                dateCreated: ''
            },
            myViewItems: false,
            permUserId: ''
        };

        this.searchPayload = {
            offset: 0,
            limit: 50,
            order: "",
            orient: "asc",
            term: {
                accountName: '',
                partnerType: '',
                billState: '',
                phone: '',
                salesRep: '',
                salesRepId: '',
                parentId: '',
                rating: '',
                dateCreated: ''
            },
            search: '',
            type: true,
            completed: false,
            permUserId: ''
        }
    }
}

interface CreateAccountResponseType {
    status: string;
    msg: string;
    extra?: Account;
}
