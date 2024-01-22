// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title AccessControlList
 */
contract Data {
    struct PermissionStruct {
        bytes32 permission;
        bool isCustom;
    }

    struct Role {
        bytes32[] permissions;
        bytes32 name;
        bool isCustom;
    }

    struct Resource {
        bytes32 name;
        string[] blacklist;
    }

    struct User {
        string ebsiDID;
        bytes32[] resourcesHashes; // this is composed by resource IDs
        uint256 createdTime;
        uint256 lastUpdate;
        uint256 lastAccess;
    }

    struct ResourcesRoles {
        bytes32 resourceName;
        Role role;
    }

    // Mapping to retrieve the DID of a user when he is connected through MetaMask
    mapping(address => string) addressesToEbsiDID;
    // Each user has its own mapping
    mapping(string => User) users;
    // Default roles and custom ones
    mapping(bytes32 => Role) roles;
    // For each couple of user-resource the mapping will return a role which define what the user can do to that resource
    mapping(bytes32 => Role) userResourceToRoleData;
    // Mapping to retrieve a resource mapped into a resourceID
    mapping(bytes32 => Resource) resourceIDToResourceData;
    // Mapping to retrieve a permission mapped into a permissionID
    mapping(bytes32 => PermissionStruct) permissionIDToPermissionData;

    // Lists of data
    // Array to store all the users - it has the ebsiDIDs inside of it
    string[] usersArray;
    // Array to store all the created roles
    bytes32[] createdRolesArray;
    // Array to store all the created resources
    bytes32[] createdResourcesArray;
    // Array to store all the created permissions
    bytes32[] createdPermissionsArray;

    // Data Mappers for uniqueness purposes
    // This is used to know if a particular user has been already created
    mapping(string => bool) existingUsers;
    // This is used to know if a particular resource has been already created
    mapping(bytes32 => bool) existingResources;
    // This is used to know if a particular role has been already created
    mapping(bytes32 => bool) existingRoles;
    // This is used to know if a particular permission has been already created
    mapping(bytes32 => bool) existingPermissions;
    // Mapping to retrieve if a particular user with a particular resource is blacklisted
    mapping(string => bool) blacklistMapping;

    // Events
    event ResourceUpdated(
        string eventType,
        bytes32 name,
        uint lastUpdated,
        string listedUser,
        bool isBlacklisted
    );

    event UserUpdated(
        string eventType,
        string ebsiDID,
        uint updatedTime,
        bytes32 addedResource
    );

    event UpdatedPermission(
        string eventType,
        PermissionStruct permission,
        uint updateTime
    );

    event UpdatedRole(
        string eventType,
        Role role,
        uint updateTime
    );

    event CustomError(
        string message
    );

    // Default permissions
    bytes32 read;
    bytes32 create;
    bytes32 edit;
    bytes32 deletePermission;
    bytes32 grant;
    bytes32 revoke;

    //INITIALIZE DATA
    function initRoles() public {
        PermissionStruct memory READ_PERMISSION = PermissionStruct({ permission: "read", isCustom: false });
        PermissionStruct memory EDIT_PERMISSION = PermissionStruct({ permission: "edit", isCustom: false });
        PermissionStruct memory DELETE_PERMISSION = PermissionStruct({ permission: "delete", isCustom: false });
        PermissionStruct memory CREATE_PERMISSION = PermissionStruct({ permission: "create", isCustom: false });
        PermissionStruct memory GRANT_PERMISSION = PermissionStruct({ permission: "grant", isCustom: false }); // Allow a user to give permissions to a user
        PermissionStruct memory REVOKE_PERMISSION = PermissionStruct({ permission: "revoke", isCustom: false }); // Allow a user to revoke permission to another user

        // Default permissions - can be added using createCustomPermissions
        read = "read";
        permissionIDToPermissionData[read] = READ_PERMISSION;
        createdPermissionsArray.push(read);
        existingPermissions[read] = true;

        edit = "edit";
        permissionIDToPermissionData[edit] = EDIT_PERMISSION;
        createdPermissionsArray.push(edit);
        existingPermissions[edit] = true;

        create = "create";
        permissionIDToPermissionData[create] = CREATE_PERMISSION;
        createdPermissionsArray.push(create);
        existingPermissions[create] = true;

        deletePermission = "delete";
        permissionIDToPermissionData[deletePermission] = DELETE_PERMISSION;
        createdPermissionsArray.push(deletePermission);
        existingPermissions[deletePermission] = true;

        grant = "grant";
        permissionIDToPermissionData[grant] = GRANT_PERMISSION;
        createdPermissionsArray.push(grant);
        existingPermissions[grant] = true;

        revoke = "revoke";
        permissionIDToPermissionData[revoke] = REVOKE_PERMISSION;
        createdPermissionsArray.push(revoke);
        existingPermissions[revoke] = true;

        bytes32 hashedUserRoleID = "user";
        bytes32 hashedEditorRoleID = "editor";
        bytes32 hashedManagerRoleID = "manager";
        bytes32 hashedAdminRoleID = "admin";

        // Default roles - can be added using createCustomRole
        createdRolesArray = [bytes32(hashedUserRoleID), hashedEditorRoleID, hashedManagerRoleID, hashedAdminRoleID];

        roles[hashedUserRoleID] = Role({ permissions: new bytes32[](1), name: 'user', isCustom: false });
        existingRoles[hashedUserRoleID] = true;

        roles[hashedEditorRoleID] = Role({ permissions: new bytes32[](4), name: 'editor', isCustom: false });
        existingRoles[hashedEditorRoleID] = true;

        roles[hashedManagerRoleID] = Role({ permissions: new bytes32[](5), name: 'manager', isCustom: false });
        existingRoles[hashedManagerRoleID] = true;

        roles[hashedAdminRoleID] = Role({ permissions: new bytes32[](6), name: 'admin', isCustom: false });
        existingRoles[hashedAdminRoleID] = true;

        roles[hashedUserRoleID].permissions[0] = read;
        roles[hashedEditorRoleID].permissions[0] = read;
        roles[hashedEditorRoleID].permissions[1] = create;
        roles[hashedEditorRoleID].permissions[2] = edit;
        roles[hashedEditorRoleID].permissions[3] = deletePermission;
        roles[hashedManagerRoleID].permissions[0] = read;
        roles[hashedManagerRoleID].permissions[1] = create;
        roles[hashedManagerRoleID].permissions[2] = edit;
        roles[hashedManagerRoleID].permissions[3] = deletePermission;
        roles[hashedManagerRoleID].permissions[4] = grant;
        roles[hashedAdminRoleID].permissions[0] = read;
        roles[hashedAdminRoleID].permissions[1] = create;
        roles[hashedAdminRoleID].permissions[2] = edit;
        roles[hashedAdminRoleID].permissions[3] = deletePermission;
        roles[hashedAdminRoleID].permissions[4] = grant;
        roles[hashedAdminRoleID].permissions[5] = revoke;
    }

    constructor() {
        initRoles();
    }
}
