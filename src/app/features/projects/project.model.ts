import { FuseUtils } from '@fuse/utils';

export class Project
{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    priority: string;
    assignedUserId: string;
    assignedUserName: string;
    description: string;

    constructor(project) {
        {
            this.id = project.id || FuseUtils.generateGUID();
            this.name = project.name || '';
            this.startDate = project.startDate || '';
            this.endDate = project.endDate || '';
            this.status = project.status || '';
            this.priority = project.priority || '';
            this.assignedUserId = project.assignedUserId || '';
            this.assignedUserName = project.assignedUserName || '';
            this.description = project.description || '';
        }
    }
}
