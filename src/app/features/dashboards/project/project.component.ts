import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { fuseAnimations } from '@fuse/animations';

import { ProjectDashboardService } from './project.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../models';
import { ApiService } from 'app/core/services/api.service';

@Component({
    selector     : 'fuse-project-dashboard',
    templateUrl  : './project.component.html',
    styleUrls    : ['./project.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseProjectDashboardComponent implements OnInit
{
    projects: any[];
    enabledProjects = ["User", "Management"];
    availableprojects = [];
    selectedProject: any;

    widgets: any;
    widgetData: any;
    widgetMgmData: any;
    widgetArtData: any;
    widgetRecevingData: any;
    widgetsExecutiveData: any;
    widgetArtWorkTypeData: any;
    fullname: string = "";
    currentUser: User;

    constructor(
        private projectDashboardService: ProjectDashboardService,
        private authService: AuthService,
        private router: Router,
        private api: ApiService,
        private auth: AuthService
    )
    {
        this.availableprojects = this.sortJsonArrayByKey(this.projectDashboardService.projects, 'name', 'ascend');
        console.log("this.availableprojects",this.availableprojects)
        this.projects= this.availableprojects.filter((value) => this.enabledProjects.includes(value["name"]));
        this.selectedProject = this.projects.find( p => p.name == 'User');
        this.widgets = this.projectDashboardService.widgets;
        this.widgetData = this.projectDashboardService.widgetData;
        this.widgetMgmData = this.projectDashboardService.widgetMgmData;
        this.widgetArtData = this.projectDashboardService.widgetArtData;
        this.currentUser = authService.getCurrentUser();
        if (this.currentUser)
            this.fullname = this.currentUser.firstName + " " + this.currentUser.lastName;

        console.log('dashboard constructor finished');
    }

    ngOnInit()
    {
    }

    selectProject(project : any){
    
        if(project.name === 'Receiving') {
            const user = this.auth.getCurrentUser();
            this.api.getReceivingWidgetData({ userId: user.userId }).subscribe((res: any[]) => {
                this.widgetRecevingData = res;
            });
        }
	if(project.name === 'Executive') {
            const user = this.auth.getCurrentUser();
            this.api.getExecutiveWidgetData({ }).subscribe((res: any[]) => {
                this.widgetsExecutiveData = res;
            });
        }

        if(project.name === 'Heatseal') {
            const user = this.auth.getCurrentUser();
            this.api.getArtworkTypeWidgetData({ type:'Heatseal' }).subscribe((res: any[]) => {
                this.widgetArtWorkTypeData = res;
                this.widgetArtWorkTypeData.type = 'Heatseal'
            });
        }

        if(project.name === 'Neck Labeling') {
            const user = this.auth.getCurrentUser();
            this.api.getArtworkTypeWidgetData({ type:'Neck Labeling' }).subscribe((res: any[]) => {
                this.widgetArtWorkTypeData = res;
                this.widgetArtWorkTypeData.type = 'Neck Labeling';
            });
        }

        this.selectedProject = project;
        this.router.navigate([`dashboard/${project.name.toLowerCase()}`]);
    }


    sortJsonArrayByKey(array, sortby, direc){
        array.sort((i1,i2) => {
            if(i1[sortby] < i2[sortby])
                return direc == 'ascend'  ? -1 : 1;
            else if(i1[sortby] > i2[sortby])
                return direc == 'descend' ? -1 : 1;
            else
                return 0;
        });
        return array;
    }
}
