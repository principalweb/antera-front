import { Component, OnInit, OnDestroy, ViewEncapsulation} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { KnowledgeBaseService } from './knowledge-base.service';
import { FuseKnowledgeBaseArticleComponent } from './dialogs/article/article.component';
import { FormControl } from '@angular/forms';
import { find } from 'lodash';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector     : 'fuse-knowledge-base',
    templateUrl  : './knowledge-base.component.html',
    styleUrls    : ['./knowledge-base.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseKnowledgeBaseComponent implements OnInit, OnDestroy
{
    knowledgeBase: any[];
    filteredKnowledgeList: any[] = [];
    onKnowledgeBaseChanged: Subscription;
    expandedList: boolean[] = [];
    searchInput: FormControl;

    constructor(
        private knowledgeBaseService: KnowledgeBaseService,
        private matDialog: MatDialog
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
        this.onKnowledgeBaseChanged =
            this.knowledgeBaseService.onKnowledgeBaseChanged
                .subscribe((response: any[]) => {
                    this.knowledgeBase = response;
                    this.filteredKnowledgeList = response;
                    for (let category of this.knowledgeBase){
                        this.expandedList.push(false);
                    }
                });
        
        this.searchInput.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
        ).subscribe(searchText => {
            this.filteredKnowledgeList = [];
            this.knowledgeBase.forEach(category => {
                const filteredArticles = this.filterByValue(category.featuredArticles, searchText);
                this.filteredKnowledgeList.push({
                    title: category.title,
                    color: category.color,
                    featuredArticles: filteredArticles
                });
            });
            this.expandedList = [];
            for (let category of this.filteredKnowledgeList){
                this.expandedList.push(false);
            }
        });
    }

    ngOnDestroy()
    {
        this.onKnowledgeBaseChanged.unsubscribe();
    }

    clearSearch() 
    {
        this.searchInput.setValue('');
        this.filteredKnowledgeList = this.knowledgeBase;
        this.expandedList = [];
        for (let category of this.filteredKnowledgeList){
            this.expandedList.push(false);
        }
    }

    readArticle(article)
    {
        this.matDialog.open(FuseKnowledgeBaseArticleComponent, {
            panelClass: 'knowledgebase-article-dialog',
            data : {article: article}
        });
    }

    expandSection(index) {
        this.expandedList[index] = !this.expandedList[index];
    }

    filterByValue(array, string) {
        return array.filter(o =>
            Object.keys(o).some(k => o[k].toLowerCase().includes(string.toLowerCase())));
    }

}
