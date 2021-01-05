import { Directive, Input, ElementRef, Renderer2, AfterContentInit, ContentChildren } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
import { AuthService } from 'app/core/services/auth.service';
import { FormControlName } from '@angular/forms';

@Directive({
    selector: '[checkPermissionAction]'
})
export class PermissionActionCtrlDirective implements AfterContentInit {

    @ContentChildren(FormControlName) controls;
    @Input() pAction: string;

    constructor(
        private element: ElementRef,
        private renderer: Renderer2,
        private permService: PermissionService,
        private authService: AuthService,
    ) { }


    ngAfterContentInit(): void {
        this.updateView();
    }

    updateView() {
        this.permService.checkUserAction(this.authService.getCurrentUser().userId, this.pAction).subscribe((res: any) => {
            if (res.data == false) {

                // Disable all children controls
                this.controls.forEach(controlDirective => {
                    controlDirective.control.disable();
                });

                // get ready for some hacky bullshit
                // checkboxes
                if (this.element.nativeElement.nextSibling && this.element.nativeElement.nextSibling.tagName == 'MAT-CHECKBOX') {
                    this.renderer.setProperty(
                        this.element.nativeElement.nextElementSibling,
                        'title',
                        'You do not have permission to perform this action. Please contact your administrator.'
                    );

                    this.renderer.setProperty(
                        this.element.nativeElement.nextElementSibling.children[0].children[0].children[0],
                        'disabled',
                        'true'
                    );
                    // entire divs
                    // don't like it much because the pointer events disable the title also
                } else if (this.element.nativeElement.nextElementSibling && this.element.nativeElement.nextSibling.tagName == 'DIV') {
                    this.renderer.setProperty(this.element.nativeElement.nextElementSibling, 'title', 'You do not have permission to perform this action. Please contact your administrator.');
                    this.renderer.setStyle(this.element.nativeElement.nextElementSibling, 'pointer-events', 'none');
                    this.renderer.setStyle(this.element.nativeElement.nextElementSibling, 'opacity', '.6');
                    // buttons
                } else if (this.element.nativeElement.nextElementSibling) {
                    this.renderer.setProperty(this.element.nativeElement.nextElementSibling, 'title', 'You do not have permission to perform this action. Please contact your administrator.');
                    this.renderer.setProperty(this.element.nativeElement.nextElementSibling, 'disabled', true);
                } else if (this.element.nativeElement && this.element.nativeElement.tagName == 'MAT-TAB') {
                }
            }
        });
    }
}
