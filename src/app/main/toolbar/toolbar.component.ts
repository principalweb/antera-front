import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, NavigationCancel, NavigationError } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models';
import { CustomerViewService } from 'app/core/services/customer-view.service';
import { ApiService } from "../../core/services/api.service";
import { SystemConfig } from "app/models/system-config";

@Component({
    selector   : 'fuse-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls  : ['./toolbar.component.scss']
})

export class FuseToolbarComponent implements OnInit
{
    userStatusOptions: any[];
    languages: any;
    selectedLanguage: any;
    showLoadingBar: boolean;
    horizontalNav: boolean;
    noNav: boolean;

    fullname: string;
    currentUser: User;

    constructor(
        private api: ApiService,
        private router: Router,
        private fuseConfig: FuseConfigService,
        private sidebarService: FuseSidebarService,
        private translate: TranslateService,
        private authService: AuthService,
        public customerViewService: CustomerViewService,
    )
    {
        this.userStatusOptions = [
            {
                'title': 'Online',
                'icon' : 'icon-checkbox-marked-circle',
                'color': '#4CAF50'
            },
            {
                'title': 'Away',
                'icon' : 'icon-clock',
                'color': '#FFC107'
            },
            {
                'title': 'Do not Disturb',
                'icon' : 'icon-minus-circle',
                'color': '#F44336'
            },
            {
                'title': 'Invisible',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#BDBDBD'
            },
            {
                'title': 'Offline',
                'icon' : 'icon-checkbox-blank-circle-outline',
                'color': '#616161'
            }
        ];

        this.languages = [
            {
                'id'   : 'en-US',
                'title': 'English',
                'flag' : 'us',
                "localeCountry": "USA",
                localeLanguage: "us"
            },
            {
                'id'   : 'en-AU',
                'title': 'Australia',
                'flag' : 'au',
                "localeCountry": "AU",
                localeLanguage: "au"
            },
            {
                id: 'en-CA',
                title: 'Canada(English)',
                flag: 'ca',
                "localeCountry": "CA",
                localeLanguage: "ca"
            },
            {
                id: 'en-NZ',
                title: 'New Zealand',
                flag: 'nz',
                "localeCountry": "NZ",
                localeLanguage: "nz"
            },
            {
                id: 'en-TR',
                title: 'Trinidad',
                flag: 'tr',
                "localeCountry": "TR",
                localeLanguage: "tr"
            },
            {
                id: 'en-MX',
                title: 'Mexico',
                flag: 'mx',
                "localeCountry": "MX",
                localeLanguage: "mx"
            },
            {
                id: 'en-GB',
                title: 'United Kingdom',
                flag: 'gb',
                "localeCountry": "GB",
                localeLanguage: "gb"
            }
        ];


        router.events.subscribe(
            (event) => {
                if ( event instanceof NavigationStart )
                {
                    this.showLoadingBar = true;
                }
                if ( event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError ) {
                    this.showLoadingBar = false;
                }
            });

        this.fuseConfig.getConfig().subscribe((settings) => {
            this.horizontalNav = settings.layout.navigation === 'top';
            this.noNav = settings.layout.navigation === 'none';
        });

        this.currentUser = authService.getCurrentUser();
        if (this.currentUser)
            this.fullname = this.currentUser.firstName + " " + this.currentUser.lastName;
    }

    ngOnInit(){
        this.api.getSystemConfigs().subscribe((configs: SystemConfig) => {
            this.selectedLanguage = this.languages.find(language => language.localeCountry === configs.localeCountry);
        });
    }

    toggleSidebarOpened(key)
    {
        this.sidebarService.getSidebar(key).toggleOpen();
    }

    search(value)
    {
        // Do your search here...
        console.log(value);
    }

    setLanguage(lang)
    {
        // Set the selected language for toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this.translate.use(lang.id);

        // Updates selected language in System Configurations
    }

    toggleCustomerView() {
        this.customerViewService.toggle();
    }

    logout() 
    {
        this.authService.signOut().subscribe((res) => {
            this.router.navigate(['/login']);
        });
    }

    openReleaseDocument()
    {
        window.open("https://s3.amazonaws.com/images.anterasoftware.com/videos/Release+Notes.pdf", "_blank");
    }
}
