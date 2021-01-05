import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { ApiService } from 'app/core/services/api.service';
import { AcademyCoursesService } from '../courses.service';
import { FuseKnowledgeBaseArticleComponent } from 'app/main/content/pages/knowledge-base/dialogs/article/article.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
    selector   : 'fuse-academy-courses',
    templateUrl: './courses.component.html',
    styleUrls  : ['./courses.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations    
})
export class FuseAcademyCoursesComponent implements OnInit, OnDestroy
{
    categories: any[];
    courses: any[];
    coursesFilteredByCategory: any[];
    filteredCourses: any[];
    categoriesSubscription: Subscription;
    coursesSubscription: Subscription;

    currentCategory = 'all';
    searchTerm = '';
    loading = false;

    constructor(
        private coursesService: AcademyCoursesService,
        private dialog: MatDialog,
        private api: ApiService,
    )
    {
    }

    ngOnInit()
    {
        // Subscribe to categories
        this.categoriesSubscription =
            this.coursesService.onCategoriesChanged
                .subscribe(categories => {
                    this.categories = categories;
                });

        // Subscribe to courses
        this.coursesSubscription =
            this.coursesService.onCoursesChanged
                .subscribe(courses => {
                    this.filteredCourses = this.coursesFilteredByCategory = this.courses = courses;
                    this.loading = false;
                });
    }

    ngOnDestroy()
    {
        this.categoriesSubscription.unsubscribe();
        this.coursesSubscription.unsubscribe();
    }

    filterCoursesByCategory()
    {
        // Filter
        if ( this.currentCategory === 'all' )
        {
            this.coursesFilteredByCategory = this.courses;
            this.filteredCourses = this.courses;
        }
        else
        {
            this.coursesFilteredByCategory = this.courses.filter((course) => {
                return course.category === this.currentCategory;
            });

            this.filteredCourses = [...this.coursesFilteredByCategory];

        }

        // Re-filter by search term
        this.filterCoursesByTerm();
    }

    filterCoursesByTerm()
    {
        const searchTerm = this.searchTerm.toLowerCase();

        // Search
        if ( searchTerm === '' )
        {
            this.filteredCourses = this.coursesFilteredByCategory;
        }
        else
        {
            this.filteredCourses = this.coursesFilteredByCategory.filter((course) => {
                return course.title.toLowerCase().includes(searchTerm);
            });
        }
    }
    watchTraining(course)
    {
    
        const article = {
        ...course,
        'content': this.checkVideoUrl(course.url) ? '<video controls><source src="'+course.url+'">our browser does not support HTML5 video.</video>' : course.url,
        'isPdf': this.checkVideoUrl(course.url) ? false : true,

        }
        this.dialog.open(FuseKnowledgeBaseArticleComponent, {
            panelClass: 'knowledgebase-article-dialog',
            data : {article: article}
        });
    }

    syncTraining()
    {
        this.loading = true;
        this.coursesService.syncCourses();
    }

    checkVideoUrl(url){
     var arr = [ "mp4", "MP4" ];
     var ext = url.substring(url.lastIndexOf(".")+1);
     if(arr.indexOf(ext) >= 0){
       return true;
      }
      return false;
  }    
}
