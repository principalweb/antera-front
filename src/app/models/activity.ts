import { BaseModel } from './base-model'
import { Attachment } from './mail';

export class Activity extends BaseModel {
    activity: string;
    assigned_id: string;
    due_date: Date;
    dueDate: Date;
    dateEntered: Date;
    assignedType:string;
    dateString: string = ''; // no output. just used for update
    id: string;
    ref_id: string;
    ref_name: string;
    ref_type: string;
    status: string;
    value: ActivityValue;
    description: string;
    ownerName: string;
    assignedName: string;
    featureImage: string;
    thumbnail: string;
    artworkCustomerId: string;
    artworkCustomerName: string;
    contactEmail: string;
    orderTab: string;
    orderDoc: string;
    
    setData(data) {
        this.setString(data, 'type');
        this.setDate(data, 'dueDate');
        //this.setDate(data, 'dateEntered');
        this.setString(data, 'id');
        this.setString(data, 'refId');
        this.setString(data, 'refName');
        this.setString(data, 'refType');
        this.setString(data, 'status');
        this.value = new ActivityValue(data.value || {});
        this.setString(data, 'ownerName');
        this.setString(data, 'assignedName');
        this.setString(data, 'assignedType');
        this.setString(data, 'description');
        this.setString(data, 'featureImage');
        this.setString(data, 'thumbnail');
        this.setString(data, 'artworkCustomerId');
        this.setString(data, 'artworkCustomerName');
        this.setString(data, 'orderTab');
        this.setString(data, 'orderDoc');
        if(data.dateEntered){
            this.setDate(data, 'dateEntered');
        }else{
            this.setString(data, 'dateEntered');
        }
    }

    updateFromForm(form: any) { 
        this.id = form.id;
        this.activity = form.type;
        this.ref_type = form.refType;
        this.ref_id = form.refId;
        this.ref_name = form.refName;
        this.status = form.status;
        this.value.updateFromForm(form);
        this.description = form.description;
        this.assignedName = form.assignedName;
        this.ownerName = form.ownerName;
        this.contactEmail = form.contactEmail;
        this.assignedType = form.assignedType;
    }

    clone() {
        const obj = this.toObject();
        return new Activity(obj);
    }
}

export class ActivityValue extends BaseModel {
    assigned: ActivityUser;
    description: string;
    dueDate: Date;
    createdDate: Date;
    dueTime: Date;
    name: string;
    owner: ActivityUser;

    // Task
    priority: string;
    reminderTimeInt: number;
    reminderTimeMetric: string;
    reminderTimeWhen: string;
    featureImage: string;
    thumbnail: string;
    artworkCustomerId: string;
    artworkCustomerName: string;
    orderTab: string;
    orderDoc: string;
    status: string;
    type: string;
    approved: string;
    approvalDate: Date;
    artworkRefId: string;
    itemType: string;
    decoTypeId: string;
    decoType: string;
    decoColor: string;
    itemColor: string;
    firmDirection: string;
    itemLink: string;

    // Meeting
    hours: number;
    minutes: number;
    location: string;

    // Note
    file: string;
    note: string;

    // Quality Control
    lostMinutes: number;
    notifyUsers: boolean;
    department: string;
    impact: string;
    reason: string;

    // Mail
    emailUid: string;
    emailUserId: string;
    emailAttachments: Attachment[];
    
    // Call
    direction: string;
    phone: string;
    
    setData(data) {
        this.assigned = new ActivityUser(data.assigned || {});
        this.setString(data, 'description');
        if (data.dueDate) this.setDate(data, 'dueDate');
        this.setDate(data, 'createdDate');
        this.setDate(data, 'dueTime');
        this.setString(data, 'name');
        this.owner = new ActivityUser(data.owner || {});
        this.setString(data, 'priority');
        this.setInt(data, 'reminderTimeInt');
        this.setString(data, 'reminderTimeMetric');
        this.setString(data, 'reminderTimeWhen');
        this.setString(data, 'featureImage');
        this.setString(data, 'thumbnail');
        this.setString(data, 'artworkCustomerId');
        this.setString(data, 'artworkCustomerName');
        this.setString(data, 'orderTab');
        this.setString(data, 'orderDoc');
        this.setString(data, 'status');
        this.setString(data, 'type');
        this.setInt(data, 'hours');
        this.setInt(data, 'minutes');
        this.setString(data, 'location');
        this.setString(data, 'file');
        this.setString(data, 'note');
        this.setInt(data, 'lostMinutes');
        this.setBoolean(data, 'notifyUsers');
        this.setString(data, 'department');
        this.setString(data, 'impact');
        this.setString(data, 'reason');

        this.setArray(data, 'emailAttachments', (val) => new Attachment(val));
        this.setString(data, 'emailUid');
        this.setString(data, 'emailUserId');
        this.setString(data, 'direction');        
        this.setString(data, 'phone');
        this.setString(data, 'approved');
        this.setDate(data, 'approvalDate');
        this.setString(data, 'artworkRefId');
        this.setString(data, 'itemType');
        this.setString(data, 'decoTypeId');
        this.setString(data, 'decoType');
        this.setString(data, 'decoColor');
        this.setString(data, 'itemColor');
        this.setString(data, 'firmDirection');
        this.setString(data, 'itemLink');
    }

    updateFromForm(form: any) {
        this.name = form.subject;
        this.owner = form.owner;
        this.assigned = form.assigned;
        this.dueDate = form.dueDate;
        this.description = form.description;
        this.priority = form.priority;
        this.type = form.taskType;
        this.reminderTimeInt = form.reminderTimeInt;
        this.reminderTimeMetric = form.reminderTimeMetric;
        this.reminderTimeWhen = form.reminderTimeWhen;
        this.featureImage = form.featureImage;
        this.thumbnail = form.thumbnail;
        this.artworkCustomerId = form.artworkCustomerId;
        this.artworkCustomerName = form.artworkCustomerName;
        this.orderTab = form.orderTab;
        this.orderDoc = form.orderDoc;
        this.hours = form.hours;
        this.minutes = form.minutes;
        this.location = form.location;
        this.file = form.file;
        this.note = form.note;
        this.lostMinutes = form.lostMinutes;
        this.notifyUsers = form.notify;
        this.department = form.department;
        this.impact = form.impact;
        this.reason = form.reason;
        this.status = form.status;

        this.emailAttachments = form.emailAttachments;
        this.emailUid = form.emailUid;
        this.emailUserId = form.emailUserId;
        this.direction = form.direction;
        this.approved = form.approved;
        this.approvalDate = form.approvalDate;
        this.artworkRefId = form.artworkRefId;
        this.itemType = form.itemType;
        this.decoTypeId = form.decoTypeId;
        this.decoType = form.decoType;
        this.decoColor = form.decoColor;
        this.itemColor = form.itemColor;
        this.firmDirection = form.firmDirection;
        this.itemLink = form.itemLink;        
        this.phone = form.phone;
    }
}

export class ActivityUser extends BaseModel {
    name: string;
    id: string;

    setData(data) {
        this.setString(data, 'name');
        this.setString(data, 'id');
    }
}
