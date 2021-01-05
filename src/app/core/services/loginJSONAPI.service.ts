import { Injectable } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';

@Injectable()
export class LoginJSONAPIService {

    constructor(
        private api: ApiService
    ) { }

    get =  function() {
        return this.api.get('/login-settings/get');
    }
    update = function (data) {
        return this.api.put('/login-settings/update',data);
    }

    login = function (data) {
        return this.api.put('/login-settings/login', data);
    }
}
