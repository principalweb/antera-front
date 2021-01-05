import { Component, ViewEncapsulation, Output, EventEmitter, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { fuseAnimations } from '@fuse/animations';
import { Artwork } from 'app/models';
import { Subscription } from 'rxjs';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
@Component({
  selector: 'app-artwork-details',
  templateUrl: './artwork-details.component.html',
  styleUrls: ['./artwork-details.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ArtworkDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
  @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
  @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
  @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
  @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;

  @Input() embedded = false;
  @Input() embeddedData = {};
  @Output() afterCreate = new EventEmitter();
  awsFileManagerType = 'artwork';
  action = 'new';
  artworkOrderId = '';
  artworkId = '';
  details = new Artwork({});
  routeChanged: Subscription;
  existingRouteReuseStrategy: any;

  constructor(private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    if (this.embedded) {
      this.action = this.embeddedData[0];
      this.details = new Artwork(this.embeddedData[1]);
    } else {

      this.existingRouteReuseStrategy = this.router.routeReuseStrategy.shouldReuseRoute;
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      
      this.routeChanged = this.route.data
        .subscribe(({ data }) => {
          if (!this.embedded) {
            this.action = data[0];
            this.details = new Artwork(data[1]);
          }
        });
    }
    if(this.details.relatedOrders && this.details.relatedOrders[0] && this.details.relatedOrders[0].orderId){
        this.artworkOrderId = this.details.relatedOrders[0].orderId;
    }
    if(this.details.design && this.details.design.id ){
        this.artworkId = this.details.design.id;
    }
    
  }

  ngOnDestroy() {
    if (!this.embedded) {
      this.router.routeReuseStrategy.shouldReuseRoute = this.existingRouteReuseStrategy;
      this.routeChanged.unsubscribe();
    }
  }

  reloadAwsFiles() {
        //alert(this.details.designNo);
  }

  tabClicked(tab) {
    switch (tab.tab.textLabel) {
      case 'Files':
        if (this.awsfilemanager) {
          this.awsfilemanager.destroy();
        }
        //this.awsfilemanager.ngOnInit();
        //this.awsfilemanager.refresh = true;
        //this.awsfilemanager.accountId = this.details.customerId;
        //this.awsfilemanager.recordId = this.details.designNo;
        //this.awsfilemanager.awsFileManagerType = 'artwork';
        //console.log('this.awsfilemanager.defaultFolder' + this.awsfilemanager.defaultFolder);
        this.awsfilemanager.getSubFolders(this.awsfilemanager.refreshFolder, 'folder');
        //this.awsfilemanager.getLevelUpFolders();
        break;
    }
  }
}
