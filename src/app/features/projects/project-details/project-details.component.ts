import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Project } from 'app/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None

})
export class ProjectDetailsComponent implements OnInit {
  
  @Output() afterCreate = new EventEmitter();
  action = 'new';
  details = new Project({});
  routeChanged: Subscription;
  existingRouteReuseStrategy: any;
  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.routeChanged = this.route.data
      .subscribe(({ data }) => {
          this.action = data[0];
          this.details = new Project(data[1]);
      });
  }

  ngOnDestroy() {
      this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;
      this.routeChanged.unsubscribe();
  }

}
