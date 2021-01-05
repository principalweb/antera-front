import { FuseUtils } from '@fuse/utils';
export class User
{
    id: string;
    userId: string;
    username: string;
    userName: string;
    firstName: string;
    lastName: string;
    token: string;
    userType: string;
    password: string;
    confirmPass: string;
    fullName: string;
    userEmail: string;
    userStatus: string;
    phone: string;
    corpIdentity: string;
    corpIdentityId: string;
    commissionGroup: string;
    dateCreated: string;
    createdBy: string;
    email: string;   

    constructor(user)
    {
        this.id = user.id;
        this.userId = user.useId;
        this.username = user.username;
        this.userName = user.userName;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.token = user.token;
        this.userType = user.userType;
        this.password = user.password || '';
        this.confirmPass = user.confirmPass || '';
        this.fullName = user.fullName || '';
        this.userEmail = user.userEmail || '';
        this.phone = user.phone || '';
        this.corpIdentity = user.corpIdentity || '';
        this.corpIdentityId = user.corpIdentityId || '';
        this.userStatus = user.userStatus || '';
        this.dateCreated = user.dateCreated || '';
        this.createdBy = user.createdBy || '';
        this.email = user.email || '';
        this.commissionGroup = user.commissionGroup || '';
    }

}

export class UserListItem {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    fullName: string;
    password: string;
    confirmPass: string;
    userEmail: string;
    userStatus: string;
    corpIdentity: string;
    commissionGroup: string;
    phone: string;
    dateCreated: string;
    createdBy: string;
    email: string;

    constructor(user) {
        this.id = user.id || FuseUtils.generateGUID();
        this.userName = user.userName || '';
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.fullName = user.fullName || '';
        this.password = user.password || '';
        this.confirmPass = user.confirmPass || '';
        this.userEmail = user.userEmail || '';
        this.userStatus = user.userStatus || '';
        this.corpIdentity = user.corpIdentity || '';
        this.commissionGroup = user.commissionGroup || '';
        this.phone = user.phone || '';
        this.dateCreated = user.dateCreated || '';
        this.createdBy = user.createdBy || '';
        this.email = user.email || '';
    }

    
}
