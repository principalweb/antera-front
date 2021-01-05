import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
// services
import { ApiService } from './api.service';
import { SelectionService } from './selection.service';
import { MessageService } from './message.service';
import { AuthService } from './auth.service';
// rxjs
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortBy } from 'lodash';
// models
import { PermissionGroupList } from '../../models/permission-group-list';
import { PermissionGroup } from '../../models/permission-group';
import { PermissionEntityGroup } from '../../models/permission-entity-group';
import { PermissionUserGroup } from '../../models/permission-user-group';
import { PermissionEntityType } from '../../models/permission-entity-type';
import { PermissionAction } from '../../models/permission-action';

@Injectable()
export class PermissionService implements Resolve<any>
{
    // permission groups
    onGroupsChanged: BehaviorSubject<PermissionGroupList[]>;
    onGroupChanged: BehaviorSubject<PermissionGroup>;
    onEntityGroupChanged: BehaviorSubject<PermissionEntityGroup[]>;
    onOtherEntityGroupChanged: BehaviorSubject<PermissionEntityGroup[]>;
    onUserGroupChanged: BehaviorSubject<PermissionUserGroup[]>;
    onOtherUserGroupChanged: BehaviorSubject<PermissionUserGroup[]>;

    groups: PermissionGroupList[];
    group: PermissionGroup;
    entityGroups: PermissionEntityGroup[] = [];
    otherEntityGroups: PermissionEntityGroup[] = [];
    userGroups: PermissionUserGroup[] = [];
    otherUserGroups: PermissionUserGroup[] = [];
    payload = {
        order: { active: "id", direction: "asc" }
    };
    enabled: boolean;

    columns = [
        'id',
        'name',
        'status'
    ];

    routeParams: any;

    constructor(
        private api: ApiService,
        private msg: MessageService,
        private sel: SelectionService,
        private auth: AuthService
    ) {
        this.onGroupsChanged = new BehaviorSubject(this.groups);
        this.onGroupChanged = new BehaviorSubject<PermissionGroup>(this.group);
        this.onEntityGroupChanged = new BehaviorSubject(this.entityGroups);
        this.onOtherEntityGroupChanged = new BehaviorSubject(this.otherEntityGroups);
        this.onUserGroupChanged = new BehaviorSubject(this.entityGroups);
        this.onOtherUserGroupChanged = new BehaviorSubject(this.otherUserGroups);

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
        this.routeParams = route.queryParams;
        return;
    }

    createGroup(data): Observable<any> {
        return this.api.createPermissionGroup(data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    getGroups(): Observable<any> {
        return this.api.getPermissionGroups().pipe(
            map((res: any) => {
                this.groups = res.data.map(group => {
                    const perm = new PermissionGroupList(group);
                    return perm;
                }).sort((a, b) => {
                    const sort = this.payload.order;
                    const isAsc = sort.direction === 'asc';
                    return (a[sort.active] < b[sort.active] ? -1 : 1) * (isAsc ? 1 : -1);
                });
                this.onGroupsChanged.next(this.groups);
            })
        );
    }

    getGroup(id): Observable<any> {
        return this.api.getPermissionGroup(id).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                return this.group;
            })
        );
    }

    setGroupEntityTypeValues(data): Observable<any> {
        return this.api.setPermissionGroupEntityTypeValues(data).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
            })
        );
    }

    addUserToGroup(data): Observable<any> {
        return this.api.addUserToPermissionGroup(data).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
            })
        );
    }

    delUserFromGroup(data): Observable<any> {
        return this.api.delUserFromPermissionGroup(data).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
            })
        );
    }

    setGroupActiveStatus(data): Observable<any> {
        return this.api.setPermissionGroupActiveStatus(data).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
            })
        );
    }

    checkUserPermissions(userId, entityId, entityType) {
        return this.api.checkUserPermissions(userId, entityId, entityType).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    // enable or disable permissions
    setPermissionStatus(st): Observable<any> {
        return this.api.setPermissionStatus(st).pipe(
            map((res: any) => {
                return res.data;
            })
        );
    }

    getPermissionStatus(userId = null): Observable<any> {
        return this.api.getPermissionStatus(userId).pipe(
            map((res: any) => {
                return res.data;
            })
        );
    }

    getEntityGroups(entityId, entityType): Observable<any> {
        return this.api.getPermissionEntityGroups(entityId, entityType).pipe(
            map((res: any) => {
                this.entityGroups = res.data.current.map(entityGroup => {
                    const perm = new PermissionEntityGroup(entityGroup);
                    return perm;
                });

                this.otherEntityGroups = res.data.other.map(entityGroup => {
                    const perm = new PermissionEntityGroup(entityGroup);
                    return perm;
                });

                this.onEntityGroupChanged.next(this.entityGroups);
                this.onOtherEntityGroupChanged.next(this.otherEntityGroups);
            })
        );
    }

    addEntityGroup(data): Observable<any> {
        return this.api.addPermissionEntityGroup(data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    removeEntityGroup(data): Observable<any> {
        return this.api.removePermissionEntityGroup(data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    getUserGroups(userId): Observable<any> {
        return this.api.getPermissionUserGroups(userId).pipe(
            map((res: any) => {
                this.userGroups = res.data.current.map(userGroup => {
                    const perm = new PermissionUserGroup(userGroup);
                    return perm;
                });

                this.otherUserGroups = res.data.other.map(userGroup => {
                    const perm = new PermissionUserGroup(userGroup);
                    return perm;
                });

                this.onUserGroupChanged.next(this.userGroups);
                this.onOtherUserGroupChanged.next(this.otherUserGroups);

            })
        );
    }

    editGroupName(id, name): Observable<any> {
        return this.api.editPermissionGroupName(id, name).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    getEntityTypes(): Observable<any> {
        return this.api.permissionGetEntityTypes().pipe(
            map((res: any) => {
                let entityTypes = res.data.map(entityType => {
                    const perm = new PermissionEntityType(entityType);
                    return perm;
                });

                return entityTypes;
            })
        )
    }

    updateEntityTypeEnabled(id, val): Observable<any> {
        return this.api.permissionUpdateEntityTypeEnabled(id, val).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    getActions(): Observable<any> {
        return this.api.permissionGetActions().pipe(
            map((res: any) => {
                let actions = res.data.map(action => {
                    const a = new PermissionAction(action);
                    return a;
                });

                return actions;
            })
        )
    }

    setGroupActionValues(data): Observable<any> {
        return this.api.permissionSetGroupActionValues(data).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
                return res;
            })
        )
    }

    checkUserAction(userId, action) {
        return this.api.checkUserAction(userId, action).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    checkModuleAccess(userId, entityType) {
        return this.api.checkModuleAccess(userId, entityType).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    addRelation(parentId, childId, detailId): Observable<any> {
        return this.api.permissionAddRelation(parentId, childId, detailId).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
                return res;
            })
        )
    }

    delRelation(hId, detailId): Observable<any> {
        return this.api.permissionDelRelation(hId, detailId).pipe(
            map((res: any) => {
                this.group = new PermissionGroup(res.data);
                this.onGroupChanged.next(this.group);
                return res;
            })
        )
    }

    getEntityType(id): Observable<any> {
        return this.api.permissionGetEntityType(id).pipe(
            map((res: any) => {
                return new PermissionEntityType(res.data);
            })
        )
    }

    updateEntityTypeOptionEnabled(id, val): Observable<any> {
        return this.api.permissionUpdateEntityTypeOptionEnabled(id, val).pipe(
            map((res: any) => {
                return res;
            })
        )
    }

    getUserActions(userId) {
        return this.api.permissionGetUserActions(userId).pipe(
            map((res: any) => {
                return res;
            })
        )
    }
}
