import { createSelector } from "@reduxjs/toolkit";
import AccessControlListType from "./accessControlListType";
import { fromBytes32ToString } from "../utilities/utilities";

// GENERAL
export const getAlert = (state: { accessControlList: AccessControlListType }) => state.accessControlList.alert;
export const getCustomErrorsAlert = (state: { accessControlList: AccessControlListType }) => state.accessControlList.customErrorsAlert;
export const getPermissionDeniedErrorsAlert = (state: { accessControlList: AccessControlListType }) => state.accessControlList.permissionDeniedErrorsAlert;
export const getLoader = (state: { accessControlList: AccessControlListType }) => state.accessControlList.loader;
export const getConnectedAccount = (state: { accessControlList: AccessControlListType }) => state.accessControlList.connectedAccount;

// PERMISSIONS
export const getPermissionsHashes = (state: { accessControlList: AccessControlListType }) => state.accessControlList.permissionsHashes;
export const getPermissions = (state: { accessControlList: AccessControlListType }) => state.accessControlList.permissions;
export const getCreatedPermission = (state: { accessControlList: AccessControlListType }) => state.accessControlList.createdPermission;
export const getDeletedPermission = (state: { accessControlList: AccessControlListType }) => state.accessControlList.deletedPermission;
export const getPermissionsOptions = createSelector([getPermissionsHashes], (permissionsHashes) => {
  return permissionsHashes?.map((permissionHash: string) => ({
    name: fromBytes32ToString(permissionHash),
    value: permissionHash
  })) || []
});

// ROLES
export const getRoles = (state: { accessControlList: AccessControlListType }) => state.accessControlList.roles;
export const getRolesHashes = (state: { accessControlList: AccessControlListType }) => state.accessControlList.rolesHashes;
export const getCreatedRole = (state: { accessControlList: AccessControlListType }) => state.accessControlList.createdRole;
export const getDeletedRole = (state: { accessControlList: AccessControlListType }) => state.accessControlList.deletedRole;

export const getCurrentUserEbsiDID = (state: { accessControlList: AccessControlListType }) => state.accessControlList.currentUserEbsiDID;

// RESOURCES
export const getResources = (state: { accessControlList: AccessControlListType }) => state.accessControlList.resources;
export const getResourcesHashes = (state: { accessControlList: AccessControlListType }) => state.accessControlList.resourcesHashes;
export const getCreatedResource = (state: { accessControlList: AccessControlListType }) => state.accessControlList.createdResource;
export const getDeletedResource = (state: { accessControlList: AccessControlListType }) => state.accessControlList.deletedResource;
export const getUpdatedResource = (state: { accessControlList: AccessControlListType }) => state.accessControlList.updatedResource;
export const getBlacklistUsers = (state: { accessControlList: AccessControlListType }) => state.accessControlList.blacklistUsers;

// USERS
export const getUsers = (state: { accessControlList: AccessControlListType }) => state.accessControlList.users;
export const getEbsiDIDs = (state: { accessControlList: AccessControlListType }) => state.accessControlList.ebsiDIDs;
export const getCreatedUser =(state: { accessControlList: AccessControlListType }) => state.accessControlList.createdUser;
export const getDeletedUser = (state: { accessControlList: AccessControlListType }) => state.accessControlList.deletedUser;
export const getUpdatedUser = (state: { accessControlList: AccessControlListType }) => state.accessControlList.updatedUser;
export const getCurrentUserInView = (state: { accessControlList: AccessControlListType }) => state.accessControlList.currentUserInView;