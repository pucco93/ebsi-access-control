import { createSlice } from '@reduxjs/toolkit';
import AccessControlListType from './accessControlListType';
import { DATA_TYPE } from '../models/BaseTypes';

const initialState: AccessControlListType = {
    // ALERTS
    alert: { show: false, msg: "", color: "" },
    customErrorsAlert: { show: false, msg: "" },
    permissionDeniedErrorsAlert: { show: false, msg: "" },
    // LOADERS
    loader: { dataType: null, show: false, msg: "" },
    // GENERAL
    connectedAccount: "",
    // USERS
    users: [],
    ebsiDIDs: [],
    currentUserEbsiDID: "",
    createdUser: null,
    deletedUser: null,
    updatedUser: null,
    currentUserInView: {
        user: '',
        resourceRoles: null
    },
    // PERMIISSIONS
    permissionsHashes: [],
    permissions: [],
    createdPermission: null,
    deletedPermission: null,
    // ROLES
    roles: [],
    rolesHashes: [],
    createdRole: null,
    deletedRole: null,
    // RESOURCES
    resources: [],
    resourcesHashes: [],
    createdResource: null,
    deletedResource: null,
    updatedResource: null,
    blacklistUsers: []
};

export const accessControlListSlice = createSlice({
    name: 'accessControlList',
    initialState,
    reducers: {
        // ALERTS
        createAlert: (state, { payload: { show, msg, color } }) => ({
            ...state,
            alert: {
                show,
                msg,
                color
            }
        }),
        deleteAlert: (state) => ({
            ...state,
            alert: {
                show: false,
                msg: '',
                color: ''
            }
        }),
        createCustomErrorsAlert: (state, { payload: { msg } }) => ({
            ...state,
            customErrorAlert: {
                msg,
                show: true
            }
        }),
        deleteCustomErrorsAlert: (state) => ({
            ...state,
            customErrorAlert: {
                msg: "",
                show: false
            }
        }),
        createPermissionDeniedErrorsAlert: (state, { payload: { msg } }) => ({
            ...state,
            permissionDeniedErrorAlert: {
                msg,
                show: true
            }
        }),
        deletePermissionDeniedErrorsAlert: (state) => ({
            ...state,
            permissionDeniedErrorAlert: {
                msg: "",
                show: false
            }
        }),
        // LOADINGS
        setLoading: (state,
            { payload: { dataType, show, msg } }:
                { payload: { dataType: DATA_TYPE, show: boolean, msg: string } }
        ) => ({
            ...state,
            loader: {
                dataType,
                show,
                msg
            }
        }),
        cancelLoading: (state) => ({
            ...state,
            loader: {
                dataType: null,
                show: false,
                msg: ''
            }
        }),
        // ACCOUNT CONNECTIONS
        connect: (state, { payload }) => ({
            ...state,
            connectedAccount: payload
        }),
        disconnect: (state) => ({
            ...state,
            connectedAccount: ''
        }),
        // USERS
        setUsers: (state, { payload }) => ({
            ...state,
            users: payload
        }),
        setEbsiDIDs: (state, { payload }) => ({
            ...state,
            ebsiDIDs: payload
        }),
        setCurrentUserEbsiDID: (state, { payload }) => ({
            ...state,
            currentUserEbsiDID: payload
        }),
        setCreatedUser: (state, { payload }) => ({
            ...state,
            createdUser: payload
        }),
        setDeletedUser: (state, { payload }) => ({
            ...state,
            deletedUser: payload
        }),
        setUpdatedUser: (state, { payload }) => ({
            ...state,
            updatedUser: payload
        }),
        setCurrentUserInView: (state, { payload }) => ({
            ...state,
            currentUserInView: payload
        }),
        // PERMISSIONS
        setPermissionsHashes: (state, { payload }) => ({
            ...state,
            permissionsHashes: payload
        }),
        setPermissions: (state, { payload }) => ({
            ...state,
            permissions: payload
        }),
        setCreatedPermission: (state, { payload }) => ({
            ...state,
            createdPermission: payload
        }),
        setDeletedPermission: (state, { payload }) => ({
            ...state,
            deletedPermission: payload
        }),
        // ROLES
        setRolesHashes: (state, { payload }) => ({
            ...state,
            rolesHashes: payload
        }),
        setRoles: (state, { payload }) => ({
            ...state,
            roles: payload
        }),
        setCreatedRole: (state, { payload }) => ({
            ...state,
            createdRole: payload
        }),
        setDeletedRole: (state, { payload }) => ({
            ...state,
            deletedRole: payload
        }),
        // RESOURCES
        setResources: (state, { payload }) => ({
            ...state,
            resources: payload
        }),
        setResourcesHashes: (state, { payload }) => ({
            ...state,
            resourcesHashes: payload
        }),
        setCreatedResource: (state, { payload }) => ({
            ...state,
            createdResource: payload
        }),
        setDeletedResource: (state, { payload }) => ({
            ...state,
            deletedResource: payload
        }),
        setUpdatedResource: (state, { payload }) => ({
            ...state,
            updatedResource: payload
        }),
        setBlacklistUsers: (state, { payload }) => ({
            ...state,
            blacklistUsers: payload
        })
    }
});

export const {
    createAlert,
    deleteAlert,
    createCustomErrorsAlert,
    deleteCustomErrorsAlert,
    createPermissionDeniedErrorsAlert,
    deletePermissionDeniedErrorsAlert,
    setLoading,
    cancelLoading,
    connect,
    disconnect,
    setUsers,
    setEbsiDIDs,
    setPermissionsHashes,
    setPermissions,
    setCreatedPermission,
    setDeletedPermission,
    setCurrentUserEbsiDID,
    setRoles,
    setRolesHashes,
    setCreatedRole,
    setDeletedRole,
    setResources,
    setResourcesHashes,
    setCreatedResource,
    setDeletedResource,
    setUpdatedResource,
    setBlacklistUsers,
    setCreatedUser,
    setDeletedUser,
    setUpdatedUser,
    setCurrentUserInView
} = accessControlListSlice.actions;

export default accessControlListSlice.reducer;