import { BaseModel } from "./base-model";

export class Mail extends BaseModel
{
    uid: string;
    from: string
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    body: string;
    date: Date;
    attachments: Attachment[];
    message: string;
    bccEmail: string;
    ccEmail: string;

    setData(data) {
        this.setString(data, 'uid');
        this.setString(data, 'from');
        this.setString(data, 'subject');
        this.setString(data, 'body');
        this.setString(data, 'message');
        this.setDate(data, 'date');
        this.setArray(data, 'to');
        this.setArray(data, 'cc');
        this.setArray(data, 'bcc');
        this.setString(data, 'ccEmail');
        this.setString(data, 'bccEmail');
        this.setArray(data, 'attachments', (val) => new Attachment(val));

        if (data.appendHtml) {
            this.body = this.body + data.appendHtml;
        }

    }
}

export class Attachment extends BaseModel {
    filename: string;
    size: number;
    data: string;
    mimetype: string;

    setData(data) {
        this.setString(data, 'filename');
        this.setInt(data, 'size');
        this.setString(data, 'data');
        this.setString(data, 'mimetype');
    }
}
