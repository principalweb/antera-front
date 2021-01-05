import { BaseModel } from './base-model';

export class Faq extends BaseModel {

    id: string;
    dateCreated: Date;
    dateModified: Date;
    question: string;
    answer: string;
    link: string;
    status: string;
    assignedUserId: string;
    assignedUser: string;
    publish: boolean;
    imageContent:any;

    setData(data) {
        this.setString(data, 'id');
        this.setDate(data, 'dateCreated');
        this.setDate(data, 'dateModified');
        this.setString(data, 'question');
        this.setString(data, 'answer');
        this.setString(data, 'link');
        this.setString(data, 'publish');
        this.setString(data, 'status');
        this.setString(data, 'assignedUserId');
        this.setString(data, 'assignedUser');
        this.setString(data, 'imageContent');
    }
}

