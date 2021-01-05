import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { GuidedSessionsService } from '../sessions.service';

@Component({
    selector   : 'fuse-guided-sessions',
    templateUrl: './sessions.component.html',
    styleUrls  : ['./sessions.component.scss']
})
export class FuseGuidedSessionsComponent implements OnInit, OnDestroy
{
    categories: any[];
    sessions: any[];
    sessionsFilteredByCategory: any[];
    filteredSessions: any[];

    categoriesSubscription: Subscription;
    sessionsSubscription: Subscription;

    currentCategory = 'all';
    searchTerm = '';

    constructor(
        private sessionsService: GuidedSessionsService
    )
    {
    }

    ngOnInit()
    {
        // Subscribe to categories
        this.categoriesSubscription =
            this.sessionsService.onCategoriesChanged
                .subscribe(categories => {
                    this.categories = categories;
                });

        // Subscribe to sessions
        this.sessionsSubscription =
            this.sessionsService.onSessionsChanged
                .subscribe(sessions => {
                    this.filteredSessions = this.sessionsFilteredByCategory = this.sessions = sessions;
                });
    }

    ngOnDestroy()
    {
        this.categoriesSubscription.unsubscribe();
        this.sessionsSubscription.unsubscribe();
    }

    filterSessionsByCategory()
    {
        // Filter
        if ( this.currentCategory === 'all' )
        {
            this.sessionsFilteredByCategory = this.sessions;
            this.filteredSessions = this.sessions;
        }
        else
        {
            this.sessionsFilteredByCategory = this.sessions.filter((course) => {
                return course.category === this.currentCategory;
            });

            this.filteredSessions = [...this.sessionsFilteredByCategory];

        }

        // Re-filter by search term
        this.filterSessionsByTerm();
    }

    filterSessionsByTerm()
    {
        const searchTerm = this.searchTerm.toLowerCase();

        // Search
        if ( searchTerm === '' )
        {
            this.filteredSessions = this.sessionsFilteredByCategory;
        }
        else
        {
            this.filteredSessions = this.sessionsFilteredByCategory.filter((course) => {
                return course.title.toLowerCase().includes(searchTerm);
            });
        }
    }
}
