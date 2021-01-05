import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { FuseSharedModule } from '@fuse/shared.module';

const routes = [
    {
        path        : 'mail',
        loadChildren: () => import('./mail/mail.module').then(m => m.FuseMailModule)
    },
    {
        path        : 'chat',
        loadChildren: () => import('./chat/chat.module').then(m => m.FuseChatModule)
    },
    {
        path        : 'academy',
        loadChildren: () => import('./academy/academy.module').then(m => m.FuseAcademyModule)
    },
    {
        path        : 'todo',
        loadChildren: () => import('./todo/todo.module').then(m => m.FuseTodoModule)
    },
    {
        path        : 'calendar',
        loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule)
    },
];

@NgModule({
    imports     : [
        FuseSharedModule,
        RouterModule.forChild(routes),
    ],
    declarations: []
})
export class FuseAppsModule
{
}
