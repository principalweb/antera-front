import { Directive, Input, ElementRef, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
import { AuthService } from 'app/core/services/auth.service';

@Directive({
    selector: '[checkPermission]'
})
export class PermissionCtrlDirective implements OnInit {

    private entityId: string;
    private entityType: string;
    private requiredPermLevel: Number;
    private requiredPermLevels = [
        'notAllowed', //0
        'allowView', //1
        'allowEdit', //2
        'allowPermission', //3
        'allowDelete' //4
    ];

    constructor(
        private element: ElementRef,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private permService: PermissionService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.updateView();
    }
    
    // val - array in form of [entityId: string, entityType: string]
    @Input()
    set checkPermission(val: string[]) {
        this.entityId = val[0];
        this.entityType = val[1];
    }

    @Input()
    set checkPermissionRequiredPermission(val: string) {
        // return key from requiredPermLevels array - determine user levels
        this.requiredPermLevel = this.requiredPermLevels.findIndex(p => p === val);
    }

    updateView() {
        if(this.entityId === '') {
            this.permService.checkModuleAccess(this.authService.getCurrentUser().userId, this.entityType).subscribe((res:any) => {
                if (!this.entityType || this.entityType === '') return this.viewContainer.createEmbeddedView(this.templateRef);
                let permLevel = 'notAllowed';
                if (res.data) {
                    // if they can delete then they can view and edit and change perms
                    if (res.data.allowDelete == "1") {
                        permLevel = 'allowDelete';
                    // if they can change perm groups they can edit and view
                    } else if (res.data.allowPermission == "1") {
                        permLevel = 'allowPermission';
                    //if they can edit then they can view
                    } else if (res.data.allowEdit == "1") {
                        permLevel = 'allowEdit';
                    // view only no edit
                    } else if (res.data.allowView == "1") {
                        permLevel = 'allowView';
                    // can't do shit yo
                    } else {
                        permLevel = 'notAllowed';
                    }
                }
                if ((this.requiredPermLevels.findIndex(p => p === permLevel)) >= this.requiredPermLevel) {
                    this.viewContainer.createEmbeddedView(this.templateRef);
                } else {
                    this.viewContainer.clear();
                }
            });
        } else {
            this.permService.checkUserPermissions(this.authService.getCurrentUser().userId, this.entityId, this.entityType).subscribe((res:any) => {
                if (!this.entityId || this.entityId === '') return this.viewContainer.createEmbeddedView(this.templateRef);
                let permLevel = 'notAllowed';
                if (res.data) {
                    // if they can delete then they can view and edit and change perms
                    if (res.data.allowDelete == "1") {
                        permLevel = 'allowDelete';
                    // if they can change perm groups they can edit and view
                    } else if (res.data.allowPermission == "1") {
                        permLevel = 'allowPermission';
                    //if they can edit then they can view
                    } else if (res.data.allowEdit == "1") {
                        permLevel = 'allowEdit';
                    // view only no edit
                    } else if (res.data.allowView == "1") {
                        permLevel = 'allowView';
                    // can't do shit yo
                    } else {
                        permLevel = 'notAllowed';
                    }
                }
                if ((this.requiredPermLevels.findIndex(p => p === permLevel)) >= this.requiredPermLevel) {
                    this.viewContainer.createEmbeddedView(this.templateRef);
                } else {
                    this.viewContainer.clear();
                }
            });
        }
        
    }
}
