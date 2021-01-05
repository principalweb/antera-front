import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, of } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSearchBarService } from './search-bar.service';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'fuse-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss']
})
export class FuseSearchBarComponent implements OnInit, OnDestroy {
    collapsed: boolean;
    fuseConfig: any;

    searchInput: FormControl;
    searchText = '';
    loading: boolean = false;

    products = [];
    productsCount = 0;
    accounts = [];
    accountsCount = 0;
    accountsEmails = [];
    accountsEmailsCount = 0;
    accountsByContact = [];
    accountsByContactCount = 0;
    contacts = [];
    contactsCount = 0;
    contactsEmails = [];
    contactsEmailsCount = 0;
    leads = [];
    leadsCount = 0;
    opportunities = [];
    opportunitiesCount = 0;
    orders = [];
    ordersCount = 0;
    quotes = [];
    quotesCount = 0;
    files = [];
    filesCount = 0;
    activities = [];
    activitiesCount = 0;
    artworks = [];
    artworksCount = 0;
    production = [];
    productionCount = 0;

    totalCount = 0;

    @Output()
    input: EventEmitter<any>;

    // Private
    private _unsubscribeAll: Subject<any>;
    shouldShowSearch: boolean;
    searched: boolean;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private service: FuseSearchBarService,
    ) {
        // Set the defaults
        this.input = new EventEmitter();
        this.collapsed = true;

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.searchInput = new FormControl('');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (config) => {
                    this.fuseConfig = config;
                }
            );

        // Subscribe to input changes
        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap((query) => {
                this.searchText = query;
            }),
            switchMap(searchText => {
                this.loading = true;
                if (searchText !== '') {
                    return this.service.search(searchText);
                }
                return of([]);
            }),
        ).subscribe((results: any[]) => {
            this.loading = false;

            if (!results || this.searchText === '') {
                this.resetResults();
                return;
            }
            this.searched = true;
            this.products = results[0].slice(0, 5);
            this.productsCount = results[0].length;
            this.accounts = results[1].slice(0, 5);
            this.accountsCount = results[1].length;
            this.contacts = results[2].slice(0, 5);
            this.contactsCount = results[2].length;
            this.leads = results[3].slice(0, 5);
            this.leadsCount = results[3].length;
            this.opportunities = results[4].slice(0, 5);
            this.opportunitiesCount = results[4].length;
            this.orders = results[5].slice(0, 5);
            this.ordersCount = results[5].length;
            this.quotes = results[6].slice(0, 5);
            this.quotesCount = results[6].length;
            this.accountsEmails = results[7].slice(0, 5);
            this.accountsEmailsCount = results[7].length;
            this.contactsEmails = results[8].slice(0, 5);
            this.contactsEmailsCount = results[8].length;
            this.accountsByContact = results[9].slice(0, 5);
            this.accountsByContactCount = results[9].length;
            this.artworks = results[10].slice(0, 5);
            this.artworksCount = results[10].length;
            this.production = results[11].slice(0, 5);
            this.productionCount = results[11].length;

            this.totalCount =
                this.productsCount +
                this.accountsCount +
                this.contactsCount +
                this.leadsCount +
                this.opportunitiesCount +
                this.ordersCount +
                this.quotesCount +
                this.activitiesCount +
                this.accountsEmailsCount +
                this.contactsEmailsCount +
                this.artworksCount +
                this.productionCount +
                this.filesCount;
        }, err => {
            this.loading = false;
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Collapse
     */
    collapse(): void {
        this.collapsed = true;
        this.resetResults();
    }

    resetResults(): void {
        this.searchInput.setValue('');
        this.searched = false;
        this.totalCount = 0;
        this.products = [];
        this.productsCount = 0;
        this.accounts = [];
        this.accountsCount = 0;
        this.accountsEmails = [];
        this.accountsEmailsCount = 0;
        this.accountsByContact = [];
        this.accountsByContactCount = 0;
        this.contacts = [];
        this.contactsCount = 0;
        this.contactsEmails = [];
        this.contactsEmailsCount = 0;
        this.leads = [];
        this.leadsCount = 0;
        this.opportunities = [];
        this.opportunitiesCount = 0;
        this.orders = [];
        this.ordersCount = 0;
        this.quotes = [];
        this.quotesCount = 0;
        this.files = [];
        this.filesCount = 0;
        this.activities = [];
        this.activitiesCount = 0;
        this.artworks = [];
        this.artworksCount = 0;
        this.production = [];
        this.productionCount = 0;

    }

    /**
     * Expand
     */
    expand(): void {
        this.collapsed = false;
    }

    /**
     * Search
     *
     * @param event
     */
    search(event): void {
        this.input.emit(event.target.value);
    }

}
