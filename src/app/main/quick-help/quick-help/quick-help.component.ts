import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Route } from '@angular/router';
import { KnowledgeBaseService } from 'app/main/content/pages/knowledge-base/knowledge-base.service';
import { HttpClient } from '@angular/common/http';
import { mergeMap, filter, map } from 'rxjs/operators';
import { FuseKnowledgeBaseArticleComponent } from 'app/main/content/pages/knowledge-base/dialogs/article/article.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-quick-help',
  templateUrl: './quick-help.component.html',
  styleUrls: ['./quick-help.component.scss']
})
export class QuickHelpComponent implements OnInit {
  helpModule: any;
  knowledgebase: any;
  filtered: any = [];
  @Input() sidebar: MatSidenav;

  constructor(private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
  }

  fetchKnowledgebase() {
    return this.http.get('https://s3.amazonaws.com/images.anterasoftware.com/videos/knowledgebase.json');
  }

  ngOnInit() {
    this.fetchKnowledgebase().subscribe((res) => {
      this.knowledgebase = res;
      this.applyFilters();
    });

    let _route = this.route.snapshot;
    if (_route.firstChild) {
      while (_route.firstChild) { _route = _route.firstChild; }
      this.setModule(_route.data['helpModule']);
    }

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.route),
      map((route) => {
        while (route.firstChild) { route = route.firstChild; }
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route) => route.data),
    ).subscribe((data) => {
      this.setModule(data['helpModule']);
    });
  }

  setModule(value) {
    if (value) {
      this.helpModule = value;
    } else {
      this.helpModule = undefined;
    }
    this.applyFilters();
  }

  readArticle(article)
    {
        this.dialog.open(FuseKnowledgeBaseArticleComponent, {
            panelClass: 'knowledgebase-article-dialog',
            data : {article: article}
        });
    }

  applyFilters() {
    if (!this.helpModule) {
      this.filtered = [];
      return;
    } else {
      if (this.knowledgebase) {
        this.filtered = this.knowledgebase.reduce((articles, group, index) => {
          if (group.title === this.helpModule) {
            articles = [...articles, ...group.featuredArticles];
          }
          return articles;
        }, []);
      }
    }

  }
}
