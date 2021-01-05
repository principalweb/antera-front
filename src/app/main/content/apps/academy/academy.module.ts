import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';

import { FuseSharedModule } from '@fuse/shared.module';

import { FuseAcademyCoursesComponent } from './courses/courses.component';
import { FuseAcademyCourseComponent } from './course/course.component';
import { AcademyCoursesService } from './courses.service';
import { AcademyCourseService } from './course.service';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
const routes = [
    {
        path     : 'courses',
        component: FuseAcademyCoursesComponent,
        resolve  : {
            academy: AcademyCoursesService
        }
    },
    {
        path     : 'courses/:courseId/:courseSlug',
        component: FuseAcademyCourseComponent,
        resolve  : {
            academy: AcademyCourseService
        }
    },
    {
        path      : '**',
        redirectTo: 'courses'
    }
];

@NgModule({
    declarations: [
        FuseAcademyCoursesComponent,
        FuseAcademyCourseComponent
    ],
    imports     : [
        RouterModule.forChild(routes),
        NgxDocViewerModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        FuseSharedModule
    ],
    providers   : [
        AcademyCoursesService,
        AcademyCourseService
    ]
})
export class FuseAcademyModule
{
}
