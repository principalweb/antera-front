import { FuseUtils } from '@fuse/utils';
import { assign } from 'lodash';

export class MailCredentials {
    id: string;
    userId: string;
    smtpUser: string;
    smtpPass: string;
    smtpServer: string;
    smtpPort: number;
    imapUser: string;
    imapPass: string;
    imapServer: string;
    imapPort: number;
    isPrimary: string;

    constructor(mailCredentials?)
    {
        mailCredentials = mailCredentials || {};
        this.id = mailCredentials.id || '';
        this.userId = mailCredentials.userId || '';
        this.smtpUser = mailCredentials.smtpUser || '';
        this.smtpPass = mailCredentials.smtpPass || '';
        this.smtpServer = mailCredentials.smtpServer || '';
        this.smtpPort = mailCredentials.smtpPort || 465;
        this.imapUser = mailCredentials.imapUser || '';
        this.imapPass = mailCredentials.imapPass || '';
        this.imapServer = mailCredentials.imapServer || '';
        this.imapPort = mailCredentials.imapPort || 993;
        this.isPrimary = mailCredentials.isPrimary || '0';
    }
}
