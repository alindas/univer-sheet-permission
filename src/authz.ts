import { Injector, Plugin } from '@univerjs/core'
import type { IActionInfo, IAllowedRequest, IBatchAllowedResponse, ICollaborator, ICreateRequest, ICreateRequest_SelectRangeObject, IListPermPointRequest, IPermissionPoint, IPutCollaboratorsRequest, IUnitRoleKV, IUpdatePermPointRequest } from '@univerjs/protocol'
import { createDefaultUser, generateRandomId, IAuthzIoService, Inject, IResourceManagerService, UserManagerService } from '@univerjs/core'
import { ObjectScope, UnitAction, UnitObject, UnitRole, UniverType } from '@univerjs/protocol'

import DataStore from './store'

const nameMap = {
    [UnitRole.Editor]: 'Editor',
    [UnitRole.Owner]: 'Owner',
    [UnitRole.Reader]: 'Reader',
    [UnitRole.UNRECOGNIZED]: 'UNRECOGNIZED',
};
export const isDevRole = (userId: string, type: UnitRole) => {

    return userId.startsWith(nameMap[type]);
};

class MyAuthzService implements IAuthzIoService {
  private _permissionMap: Map<string, ICreateRequest_SelectRangeObject & { objectType: UnitObject }> = new Map([])

  constructor(
    @IResourceManagerService private _resourceManagerService: IResourceManagerService,
    @Inject(UserManagerService) private _userManagerService: UserManagerService,
  ) {
    this._initSnapshot()
    // this._initDefaultUser()
  }

  private _initDefaultUser() {
    const currentUser = this._userManagerService.getCurrentUser()
    console.log('lhh-log:initDefaultUser', currentUser);
    const currentUserIsValid = currentUser && currentUser.userID
    if (!currentUserIsValid) {
      console.log('lhh-log:initDefaultUser:setCurrentUser', createDefaultUser(UnitRole.Owner));
      // this._userManagerService.setCurrentUser(createDefaultUser(UnitRole.Owner))
      this._userManagerService.setCurrentUser({
        userID: '40727',
        name: 'lhh'
      })
    }
  }

  private _getRole(type: UnitRole) {
    console.log('lhh-log:getRole', type);
    const user = this._userManagerService.getCurrentUser()
    console.log('lhh-log:getRole', user);
    if (!user) {
      return false
    }
    return true;
    return isDevRole(user.userID, type)
  }

  private _initSnapshot() {
    this._resourceManagerService.registerPluginResource({
      toJson: (_unitId: string) => {
        const obj = [...this._permissionMap.keys()].reduce((r, k) => {
          const v = this._permissionMap.get(k)
          r[k] = v!
          return r
        }, {} as Record<string, ICreateRequest_SelectRangeObject & { objectType: UnitObject }>)
        console.log('lhh-log:toJson', obj);
        return JSON.stringify(obj)
      },
      parseJson: (json: string) => {
        console.log('lhh-log:parseJson', json);
        return JSON.parse(json)
      },
      pluginName: 'SHEET_AuthzIoMockService_PLUGIN',
      businesses: [UniverType.UNIVER_SHEET, UniverType.UNIVER_DOC, UniverType.UNIVER_SLIDE],
      onLoad: (_unitId, resource) => {
        console.log('lhh-log:onLoad', _unitId, resource);
        for (const key in resource) {
          this._permissionMap.set(key, resource[key])
        }
      },
      onUnLoad: () => {
        console.log('lhh-log:onUnLoad');
        // this._permissionMap.clear()
      },
    })
  }

  async create(config: ICreateRequest): Promise<string> {
    const permissionId = generateRandomId(8)
    if (config.objectType === UnitObject.SelectRange && config.selectRangeObject) {
      this._permissionMap.set(permissionId, { ...config.selectRangeObject, objectType: config.objectType })
    }
    console.log('lhh-log:create', config, permissionId, this._permissionMap);
    return permissionId
  }

  async batchAllowed(config: IAllowedRequest[]): Promise<IBatchAllowedResponse['objectActions']> {
    console.log('lhh-log:batchAllowed', config);
    const selectionRangeConfig = config.filter(c => c.objectType === UnitObject.SelectRange)
    if (selectionRangeConfig.length) {
      const currentUser = this._userManagerService.getCurrentUser()
      const res = [] as IBatchAllowedResponse['objectActions']
      selectionRangeConfig.forEach((c) => {
        res.push({
          unitID: c.unitID,
          objectID: c.objectID,
          actions: c.actions.map((action) => {
              return { action, allowed: true }
              if (isDevRole(currentUser.userID, UnitRole.Owner)) {
              return { action, allowed: true }
            }
            return { action, allowed: false }
          }),
        })
      })
      return res
    }
    return Promise.resolve([])
  }

  async list(config: IListPermPointRequest): Promise<IPermissionPoint[]> {
    const result: IPermissionPoint[] = []
    const creator = this._userManagerService.getCurrentUser()
    config.objectIDs.forEach((objectID) => {
      const rule = this._permissionMap.get(objectID)
      if (rule) {
        const item = {
          objectID,
          unitID: config.unitID,
          objectType: rule!.objectType,
          name: rule!.name,
          shareOn: false,
          shareRole: UnitRole.Owner,
          shareScope: -1,
          scope: {
            read: ObjectScope.AllCollaborator,
            edit: ObjectScope.AllCollaborator,
          },
          creator,
          strategies: [
            {
              action: UnitAction.View,
              role: UnitRole.Owner,
            },
            {
              action: UnitAction.Edit,
              role: UnitRole.Owner,
            },
          ],
          actions: config.actions.map((a) => {
            return { action: a, allowed: this._getRole(UnitRole.Owner) }
          }),
        }
        result.push(item)
      }
    })
    console.log('lhh-log:list', this._permissionMap, creator, config, result);
    return result
  }

  async listCollaborators(): Promise<ICollaborator[]> {
    // List the existing collaborators
    console.log('lhh-log:listCollaborators')
    const userList = DataStore.get('userList')
    return userList.map(u => ({
      id: u.userID,
      role: UnitRole.Editor,
      subject: u
    }))
  }

  async allowed(_config: IAllowedRequest): Promise<IActionInfo[]> {
    // Because this is a mockService for handling permissions, we will not write real logic in it. We will only return an empty array to ensure that the permissions originally set by the user are not modified.
    // If you want to achieve persistence of permissions, you can modify the logic here.
    console.log('lhh-log:allowed', _config);
    return Promise.resolve([
      { action: UnitAction.Edit, allowed: true },
      { action: UnitAction.View, allowed: true },
      { action: UnitAction.Delete, allowed: true },
      { action: UnitAction.Copy, allowed: true },
    ])
  }

  async listRoles(): Promise<{ roles: IUnitRoleKV[], actions: UnitAction[] }> {
    console.log('lhh-log:listRoles')
    return {
      roles: [],
      actions: [],
    }
  }

  async update(config: IUpdatePermPointRequest): Promise<void> {
    // Update bit information
    console.log('lhh-log:update', config);
  }

  async updateCollaborator(): Promise<void> {
    console.log('lhh-log:updateCollaborator');
    // Update collaborator information
    return undefined
  }

  async createCollaborator(): Promise<void> {
    console.log('lhh-log:createCollaborator');
    // Create new collaborator information
    return undefined
  }

  async deleteCollaborator(): Promise<void> {
    console.log('lhh-log:deleteCollaborator');
    return undefined
  }

  async putCollaborators(config: IPutCollaboratorsRequest): Promise<void> {
    console.log('lhh-log:putCollaborators', config);
    return undefined
  }
}

export class MyAuthzPlugin extends Plugin {
  static override pluginName = 'my-authz-plugin'
  constructor(
    @Inject(Injector) protected override _injector: Injector,
  ) {
    super()
  }

  override onStarting(): void {
    console.log('MyAuthzPlugin onStarting')
    this._injector.add([IAuthzIoService, { useClass: MyAuthzService }])
  }
}