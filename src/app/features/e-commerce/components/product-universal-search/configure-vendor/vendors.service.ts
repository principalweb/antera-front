import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { findIndex } from 'lodash';

import { ApiService } from 'app/core/services/api.service';
import { ModuleField } from 'app/models/module-field';
import { AuthService } from 'app/core/services/auth.service';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class VendorsService {


    constructor(
        private api: ApiService,
        private authService: AuthService
    ) {
    }
    searchVendor(vendor): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.get('/content/alias-match?vendor=' + encodeURIComponent(vendor))
                .subscribe((list: any) => {
                    resolve(list);
                }, err => reject(err));

        });
    }
    acceptVendor(data): Promise<any> {
        return new Promise((resolve, reject) => {
            this.api.post('/content/accept-alias-match',data)
                .subscribe((list: any) => {
                    resolve(list);
                }, err => reject(err));

        });
    }

   
}
