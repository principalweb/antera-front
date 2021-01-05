import { BaseModel } from './base-model';

export class Project extends BaseModel
{
    id: string;
    name: string;
    description: string;
    dateCreated: string;
    dateModified: string;
    accountManagerId: string;
    accountManagerName: string;
    assignedUserId: string;
    assignedUserName: string;
    assignee: string;
    modifiedUserId: string;
    modifiedUserName: string;
    createdById: string;
    createdByName: string;
    estimatedStartDate: string;
    estimatedEndDate: string;
    dueDate: string;
    status: string;
    priority: string;
    accountId: string;
    accountName: string;
    converted: string;
    presentationLayout: string;
    textFieldExtra1: string;
    textFieldExtra2: string;
    textFieldExtra3: string;
    textFieldExtra4: string;
    textFieldExtra5: string;
    textFieldExtra6: string;
    textFieldExtra7: string;
    textFieldExtra8: string;
    textFieldExtra9: string;
    textFieldExtra10: string;
    
    

    setData(project) {
        {
            this.setString(project, 'id');
            this.setString(project, 'name');
            this.setString(project, 'description');
            this.setDate(project, 'dateCreated');
            this.setDate(project, 'dateModified');
            this.setString(project, 'accountManagerId');
            this.setString(project, 'accountManagerName');
            this.setString(project, 'assignedUserId');
            this.setString(project, 'assignedUserName');
            this.setString(project, 'assignee');
            this.setString(project, 'modifiedUserId');
            this.setString(project, 'modifiedUserName');
            this.setString(project, 'createdById');
            this.setString(project, 'createdByName');
            this.setDate(project, 'estimatedStartDate');
            this.setDate(project, 'estimatedEndDate');
            this.setDate(project, 'dueDate');
            this.setString(project, 'status');
            this.setString(project, 'priority');
            this.setString(project, 'accountId');
            this.setString(project, 'accountName');
            this.setString(project, 'converted');
            this.setString(project, 'presentationLayout');
            this.setString(project, 'textFieldExtra1');
            this.setString(project, 'textFieldExtra2');
            this.setString(project, 'textFieldExtra3');
            this.setString(project, 'textFieldExtra4');
            this.setString(project, 'textFieldExtra5');
            this.setString(project, 'textFieldExtra6');
            this.setString(project, 'textFieldExtra7');
            this.setString(project, 'textFieldExtra8');
            this.setString(project, 'textFieldExtra9');
            this.setString(project, 'textFieldExtra10');
        }
    }
}
