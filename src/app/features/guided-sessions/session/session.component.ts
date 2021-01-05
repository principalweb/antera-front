import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { fuseAnimations } from '@fuse/animations';

import { GuidedSessionService } from '../session.service';

@Component({
    selector     : 'fuse-guided-session',
    templateUrl  : './session.component.html',
    styleUrls    : ['./session.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseGuidedSessionComponent implements OnInit, OnDestroy, AfterViewInit
{
    session: any;
    sessionSubscription: Subscription;
    currentStep = 0;
    sessionStepContent;
    animationDirection: 'left' | 'right' | 'none' = 'none';
    @ViewChildren(FusePerfectScrollbarDirective) fuseScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;

    constructor(
        private sessionService: GuidedSessionService,
        private changeDetectorRef: ChangeDetectorRef
    )
    {

    }

    ngOnInit()
    {
        // Subscribe to sessions
        this.sessionSubscription =
            this.sessionService.onSessionChanged
                .subscribe(session => {
                    this.session = session;
                });
    }

    ngAfterViewInit()
    {
        this.sessionStepContent = this.fuseScrollbarDirectives.find((fuseScrollbarDirective: FusePerfectScrollbarDirective) => {
            return fuseScrollbarDirective.elementRef.nativeElement.id === 'session-step-content';
        });
    }

    ngOnDestroy()
    {
        this.sessionSubscription.unsubscribe();
    }

    gotoStep(step)
    {
        // Decide the animation direction
        this.animationDirection = this.currentStep < step ? 'left' : 'right';

        // Run change detection so the change
        // in the animation direction registered
        this.changeDetectorRef.detectChanges();

        // Set the current step
        this.currentStep = step;
    }

    gotoNextStep()
    {
        if ( this.currentStep === this.session.totalSteps - 1 )
        {
            return;
        }

        // Set the animation direction
        this.animationDirection = 'left';

        // Run change detection so the change
        // in the animation direction registered
        this.changeDetectorRef.detectChanges();

        // Increase the current step
        this.currentStep++;
    }

    gotoPreviousStep()
    {
        if ( this.currentStep === 0 )
        {
            return;
        }

        // Set the animation direction
        this.animationDirection = 'right';

        // Run change detection so the change
        // in the animation direction registered
        this.changeDetectorRef.detectChanges();

        // Decrease the current step
        this.currentStep--;
    }
}
