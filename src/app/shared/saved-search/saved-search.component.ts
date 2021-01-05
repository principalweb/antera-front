import { Component, OnInit, Input, Output, ViewEncapsulation, EventEmitter, OnDestroy, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription ,  Observable } from 'rxjs';

@Component({
  selector: 'saved-search',
  templateUrl: './saved-search.component.html',
  styleUrls: ['./saved-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SavedSearchComponent implements OnInit {

    // module for the search i.e workflow
    @Input() searchModule: any;
    // receive paramSubject in target component
    @Input() searchParams: Observable<void>;

    // emit the saved search params to the target component
    @Output() savedSearchParams= new EventEmitter<any>();

    // params received from the target component
    params: any;
    // the searches saved for this module
    savedSearches: any;

    private paramsSubscription: any;
    constructor(
        private http: HttpClient,
    ) {}

    ngOnInit() {
        this.paramsSubscription = this.searchParams.subscribe((data) => {
            this.params = data;
        });
    }
    
    sendSearchCriteria(search) {
        this.savedSearchParams.emit(search);
    }

    ngOnDestroy() {
        this.paramsSubscription.unsubscribe();
    }

    saveCurrentSearch() {
        if (!this.params) {
            return;
        };
        let user = JSON.parse(localStorage.getItem('anteraUser'));
        let data = {
            value: this.params,
            module: this.searchModule,
            userId: user.userId,
            setting: 'test1'
        };

        console.log(data);

        this.http.post('/protected/content/set-user-setting', data)
            .subscribe((response: any) => {
                console.log(response);
            });
    }

    getSavedSearches() {
        let user = JSON.parse(localStorage.getItem('anteraUser'));
        let data = {
            userId: user.userId,
            module: this.searchModule
        }

        console.log(data);

        this.http.post('/protected/content/get-user-module-setting', data)
            .subscribe((response) => {
                //console.log(response);
                this.savedSearches = response;
            });
    }
}
