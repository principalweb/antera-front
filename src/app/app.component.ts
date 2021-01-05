import { Component, Renderer2, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';

import { locale as navigationEnglish } from '@fuse/components/navigation/i18n/en';
import { locale as navigationTurkish } from '@fuse/components/navigation/i18n/tr';
import { CustomerViewService } from './core/services/customer-view.service';
import { DOCUMENT } from '@angular/common';


@Component({
    selector   : 'fuse-root',
    templateUrl: './app.component.html',
    styleUrls  : ['./app.component.scss']
})
export class AppComponent
{
    constructor(
        private translate: TranslateService,
        private fuseNavigationService: FuseNavigationService,
        private fuseSplashScreen: FuseSplashScreenService,
        private renderer: Renderer2,
        @Inject(DOCUMENT) private document: Document,
        private customerViewService: CustomerViewService,
        private fuseTranslationLoader: FuseTranslationLoaderService,
    )
    {
        // Add initialized class
        this.renderer.addClass(document.body, 'initialized');

        // Add languages
        this.translate.addLangs(['en', 'tr']);

        // Set the default language
        this.translate.setDefaultLang('en');

        // Set the navigation translations
        this.fuseTranslationLoader.loadTranslations(navigationEnglish, navigationTurkish);

        // Use a language
        this.translate.use('en');

        // Initialize customer view service
        this.customerViewService.initialize();

    }
}
