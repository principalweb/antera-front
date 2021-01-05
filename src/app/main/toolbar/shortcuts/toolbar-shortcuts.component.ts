import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { FuseMatchMediaService } from '@fuse/services/match-media.service';
import { FuseConfigService } from '@fuse/services/config.service';

import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityFormDialogComponent } from '../../../shared/activity-form/activity-form.component';
import { MediaObserver } from '@angular/flex-layout';

@Component({
    selector   : 'toolbar-shortcuts',
    templateUrl: './toolbar-shortcuts.component.html',
    styleUrls  : ['./toolbar-shortcuts.component.scss']
})
export class ToolbarShortcutsComponent implements OnInit, OnDestroy
{
    mobileShortcutsPanelActive = false;
    toolbarColor: string;
    matchMediaSubscription: Subscription;
    onConfigChanged: Subscription;

    @ViewChild('shortcuts', {static: true}) shortcutsEl: ElementRef;

    dialogRef: MatDialogRef<ActivityFormDialogComponent>;

    constructor(
        private renderer: Renderer2,
        private observableMedia: MediaObserver,
        private fuseMatchMedia: FuseMatchMediaService,
        private fuseConfig: FuseConfigService,
        private actvitiyService: ActivitiesService,
        public dialog: MatDialog

    )
    {

        this.onConfigChanged =
            this.fuseConfig.getConfig()
                .subscribe(
                    (newSettings) => {
                        this.toolbarColor = newSettings.colorClasses.toolbar;
                    }
                );
    }

    ngOnInit()
    {
    
        this.matchMediaSubscription =
            this.fuseMatchMedia.onMediaChange.subscribe(() => {
                if ( this.observableMedia.isActive('gt-sm') )
                {
                    this.hideMobileShortcutsPanel();
                }
            });
    }

    ngOnDestroy()
    {
        this.matchMediaSubscription.unsubscribe();
    }

    showMobileShortcutsPanel()
    {
        this.mobileShortcutsPanelActive = true;
        this.renderer.addClass(this.shortcutsEl.nativeElement, 'show-mobile-panel');
    }

    hideMobileShortcutsPanel()
    {
        this.mobileShortcutsPanelActive = false;
        this.renderer.removeClass(this.shortcutsEl.nativeElement, 'show-mobile-panel');
    }

    createActivityCall(){
        this.newActivity('Call');
    }

    createActivityNote(){
        this.newActivity('Note');
    }

    createActivityMeeting(){
        this.newActivity('Meeting');
    }

    createActivityTask(){
        this.newActivity('Task');
    }

    createActivityQC(){
        this.newActivity('Quality Control');
    }

    newActivity(type = 'Task'){
        this.dialogRef = this.dialog.open(ActivityFormDialogComponent, {
          panelClass: 'activity-form-dialog',
          data      : {
              action: 'new',
              type : type,
              service : this.actvitiyService
          }
        });
    }
}
