import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { MetaReducer, StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';

import { environment } from 'environments/environment';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { reducers, effects, CustomSerializer } from '.';

export const metaReducers: MetaReducer<any>[] = !environment.production
    ? []
    : [];

@NgModule({
    imports  : [
        StoreModule.forRoot(reducers, {metaReducers, runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true }}),
        EffectsModule.forRoot(effects),
        !environment.production ? StoreDevtoolsModule.instrument() : [],
        StoreRouterConnectingModule
    ],
    providers: [
        {
            provide : RouterStateSerializer,
            useClass: CustomSerializer
        }
    ]
})

export class AppStoreModule
{
}
