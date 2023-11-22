// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

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
        string name;
        bool isCustom;
    }

    struct Resource {
        string name;
        string UID;
        string[] blacklist;
    }

    struct User {
        string ebsiDID;
        string[] resourcesUIDs; // this is composed by resource IDs
        uint256 createdTime;
        uint256 lastUpdate;
        uint256 lastAccess;
    }

    struct ResourcesRoles {
        string resourceName;
        Role role;
    }

    // Each user has its own mapping
    mapping(string => User) users;
    // Default roles and custom ones
    mapping(string => Role) roles;
    // For each couple of user-resource the mapping will return a role which define what the user can do to that resource
    mapping(string => Role) userResourceToRoleData;
    // Mapping to retrieve a resource mapped into a resourceID
    mapping(string => Resource) resourceIDToResourceData;
    // Mapping to retrieve a permission mapped into a permissionID
    mapping(bytes32 => PermissionStruct) permissionIDToPermissionData;

    // Lists of data
    // Array to store all the users - it has the ebsiDID inside of it
    string[] usersArray;
    // Array to store all the created roles
    string[] createdRolesArray;
    // Array to store all the created resources
    string[] createdResourcesArray;
    // Array to store all the created permissions
    bytes32[] createdPermissionsArray;

    // Default Permissions
    bytes32 read;
    bytes32 create;
    bytes32 edit;
    bytes32 deletePermission;
    bytes32 grant;
    bytes32 revoke;

    // Events
    event ResourceUpdated(
        uint lastUpdate,
        string resourceUpdated,
        string listedUser,
        bool isBlacklisted
    );

    event UserAdded(
        string ebsiDID,
        uint createdTime,
        uint lastAccess
    );

    event UserRemoved(
        string ebsiDID,
        uint deletionTime
    );

    event UserNotFound(
        string advice
    );

    event UserUpdated(
        uint lastUpdate,
        string ebsiDID,
        string[] addedResources,
        string[] removedResources,
        string[] resourcesWithProblems
    );

    function createPermissionHash(bytes32 permissionToHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(permissionToHash));
    }

    function createPermissionUIDs(PermissionStruct[] calldata permissionsData) internal pure returns (bytes32[] memory permissionUIDs) {
        permissionUIDs = new bytes32[](permissionsData.length);
        for(uint i = 0; i < permissionsData.length; i++) {
            permissionUIDs[i] = keccak256(abi.encodePacked(permissionsData[i].permission));
        }

        return permissionUIDs;
    }

    //INITIALIZE DATA
    function initRoles() public {
        PermissionStruct memory READ = PermissionStruct({ permission: "read", isCustom: false });
        PermissionStruct memory EDIT = PermissionStruct({ permission: "edit", isCustom: false });
        PermissionStruct memory DELETE = PermissionStruct({ permission: "delete", isCustom: false });
        PermissionStruct memory CREATE = PermissionStruct({ permission: "create", isCustom: false });
        PermissionStruct memory GRANT = PermissionStruct({ permission: "grant", isCustom: false }); // Allow a user to give permissions to a user
        PermissionStruct memory REVOKE = PermissionStruct({ permission: "revoke", isCustom: false }); // Allow a user to revoke permission to another user

        // Default permissions - can be added using createCustomPermissions
        read = createPermissionHash('read');
        permissionIDToPermissionData[read] = READ;
        createdPermissionsArray.push(permissionIDToPermissionData[read].permission);
        edit = createPermissionHash('edit');
        permissionIDToPermissionData[edit] = EDIT;
        createdPermissionsArray.push(permissionIDToPermissionData[edit].permission);
        create = createPermissionHash('create');
        permissionIDToPermissionData[create] = CREATE;
        createdPermissionsArray.push(permissionIDToPermissionData[create].permission);
        deletePermission = createPermissionHash('delete');
        permissionIDToPermissionData[deletePermission] = DELETE;
        createdPermissionsArray.push(permissionIDToPermissionData[deletePermission].permission);
        grant = createPermissionHash('grant');
        permissionIDToPermissionData[grant] = GRANT;
        createdPermissionsArray.push(permissionIDToPermissionData[grant].permission);
        revoke = createPermissionHash('revoke');
        permissionIDToPermissionData[revoke] = REVOKE;
        createdPermissionsArray.push(permissionIDToPermissionData[revoke].permission);

        // Default roles - can be added using createCustomRole
        createdRolesArray = ['user', 'editor', 'manager', 'admin'];
        roles['user'] = Role({ permissions: new bytes32[](1), name: 'user', isCustom: false });
        roles['editor'] = Role({ permissions: new bytes32[](4), name: 'editor', isCustom: false });
        roles['manager'] = Role({ permissions: new bytes32[](5), name: 'manager', isCustom: false });
        roles['admin'] = Role({ permissions: new bytes32[](6), name: 'admin', isCustom: false });

        roles['user'].permissions[0] = read;
        roles['editor'].permissions[0] = read;
        roles['editor'].permissions[1] = create;
        roles['editor'].permissions[2] = edit;
        roles['editor'].permissions[3] = deletePermission;
        roles['manager'].permissions[0] = read;
        roles['manager'].permissions[1] = create;
        roles['manager'].permissions[2] = edit;
        roles['manager'].permissions[3] = deletePermission;
        roles['manager'].permissions[4] = grant;
        roles['admin'].permissions[0] = read;
        roles['admin'].permissions[1] = create;
        roles['admin'].permissions[2] = edit;
        roles['admin'].permissions[3] = deletePermission;
        roles['admin'].permissions[4] = grant;
        roles['admin'].permissions[5] = revoke;
    }

    constructor() {
        initRoles();
    }
}
