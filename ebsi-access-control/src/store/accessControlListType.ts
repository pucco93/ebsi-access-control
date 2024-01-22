import User from "../models/User";
import { DATA_TYPE } from "../models/BaseTypes";
import { AlertColor } from "@mui/material";

type AccessControlListType = {
    alert: {
        show: boolean,
        msg: string,
        color: string
    },
    customErrorsAlert: {
        show: boolean,
        msg: string
    },
    loader: {
        dataType: DATA_TYPE,
        show: boolean,
        msg: string
    },
    connectedAccount: string,
    users: User[],
    ebsiDIDs: string[],
    permissionsHashes: string[],
    permissions: Permission[],
    createdPermission: { status: AlertColor | undefined, permission: any | null } | null,
    deletedPermission: { status: AlertColor | undefined, permission: any | null } | null
    currentUserEbsiDID: string,
    roles: Role[],
    rolesHashes: string[],
    createdRole: { status: AlertColor | undefined, role: Role | null } | null,
    deletedRole: { status: AlertColor | undefined, role: Role | null } | null,
    resources: Resource[],
    resourcesHashes: string[],
    createdResource: { status: AlertColor | undefined, resource: Role | null } | null,
    deletedResource: { status: AlertColor | undefined, resource: Role | null } | null,
    createdUser: { status: AlertColor | undefined, ebsiDID: string } | null,
    deletedUser: { status: AlertColor | undefined, ebsiDID: string } | null,
    updatedUser: { status: AlertColor | undefined, ebsiDID: string } | null
};

export default AccessControlListType;