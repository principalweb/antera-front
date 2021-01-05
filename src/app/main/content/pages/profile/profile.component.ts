import { Component, ViewEncapsulation } from '@angular/core';

import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../models';

@Component({
    selector     : 'fuse-profile',
    templateUrl  : './profile.component.html',
    styleUrls    : ['./profile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseProfileComponent
{
    fullname: string = "";
    currentUser: User; 

    constructor(private authService:AuthService)
    {
        this.currentUser = authService.getCurrentUser();
        if (this.currentUser)
            this.fullname = this.currentUser.firstName + " " + this.currentUser.lastName;
    }
}
