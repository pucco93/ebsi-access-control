// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import "./IAccessControlList.sol";
import "./Utilities.sol";

/**
 * @title AccessControlList
 */
contract AccessControlList is IAccessControlList, Utilities {
    constructor() {}

    // USERS FUNCTIONS
    // Check whether the user has the permission or not
    function checkPermission(
        string calldata _ebsiDID,
        bytes32 _resourceID,
        bytes32 _permission
    ) external view override returns (bool) {
        Role storage _userRole = userResourceToRoleData[
            createResourceToRoleHash(_ebsiDID, _resourceID)
        ];
        bool hasPermission = false;
        if (_userRole.permissions.length > 0) {
            for (uint256 i = 0; i <= _userRole.permissions.length; i++) {
                if (_userRole.permissions[i] == _permission) {
                    hasPermission = true;
                }
            }
        }
        return hasPermission;
    }

    // Check if user has already been created, using an ebsiDID and cycling through the entire list of created users (only ebsiDID must be stored)
    function isUserAlreadyCreated(
        string calldata ebsiDID,
        bool skipSendEvent
    ) external override returns (bool) {
        if (existingUsers[ebsiDID] && !skipSendEvent) {
            emit CustomError("User already exist!");
        }
        return existingUsers[ebsiDID];
    }

    // Passing a name will create a new resource - passing name to keccak to have a uniqueID, the struct also have a blacklist
    function createUser(
        string calldata ebsiDID,
        bytes32[] calldata resourcesNames
    ) external override returns (User memory user) {
        require(!this.isUserAlreadyCreated(ebsiDID, false));
        users[ebsiDID] = User(
            ebsiDID,
            resourcesNames,
            block.timestamp,
            block.timestamp,
            0
        );
        usersArray.push(ebsiDID);
        existingUsers[ebsiDID] = true;

        emit UserUpdated('creation', ebsiDID, block.timestamp, '');
        return users[ebsiDID];
    }

    // Remove user from the blockchain (from now on using delete)
    function removeUser(
        string calldata ebsiDID,
        string[] memory newUsersArray
    ) external override returns (bool removed) {
        usersArray = newUsersArray;
        existingUsers[ebsiDID] = false;
        emit UserUpdated('deletion', ebsiDID, block.timestamp, '');
        return true;
    }

    // Get all ebsiDIDs without relative users data
    function getAllEbsiDIDs() external virtual view override returns (string[] memory ebsiDIDs) {
        return usersArray;
    }

    // Get a single user by his ebsiDID
    function getUser(
        string calldata ebsiDID
    ) public view override returns (User memory) {
        return users[ebsiDID];
    }

    // Get all Roles of a user
    function getAllUserRoles(
        string calldata ebsiDID
    ) external view override returns (ResourcesRoles[] memory) {
        bytes32[] memory resourcesHashes = users[ebsiDID].resourcesHashes;
        ResourcesRoles[] memory resourcesRoles = new ResourcesRoles[](
            resourcesHashes.length
        );
        if (resourcesHashes.length > 0) {
            for (uint256 i = 0; i < resourcesHashes.length; i++) {
                resourcesRoles[i] = ResourcesRoles({
                    role: userResourceToRoleData[
                        createResourceToRoleHash(ebsiDID, resourcesHashes[i])
                    ],
                    resourceName: resourceIDToResourceData[resourcesHashes[i]]
                        .name
                });
            }
        }
        return resourcesRoles;
    }

    // Get all the users (cycle through the entire list of users, returning al ist of ebsiDID)
    function getAllUsers() external view override returns (User[] memory) {
        User[] memory tempUsers = new User[](usersArray.length);
        uint tempUsersCounter = 0;
        if (usersArray.length > 0) {
            for (uint256 i = 0; i < usersArray.length; i++) {
                tempUsers[tempUsersCounter] = users[usersArray[i]];
                tempUsersCounter++;
            }
        }

        return tempUsers;
    }

    // Check if a user is already in blacklist
    function isUserAlreadyInBlacklist(
        string calldata ebsiDID,
        Resource storage resource
    ) internal returns (bool) {
        bool isAlreadyBlacklisted = blacklistMapping[
            Utilities.createStringHashFrom2Args(ebsiDID, resource.name)
        ];
        if (isAlreadyBlacklisted) {
            emit CustomError("User already in blacklist!");
        }
        return isAlreadyBlacklisted;
    }

    function assignResourceToUser(string calldata ebsiDID, bytes32 resourceName, Role memory role) external override {
        users[ebsiDID].resourcesHashes.push(resourceName);
        userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourceName)] = role;

        emit UserUpdated(
            'updated-resource-added',
            ebsiDID,
            block.timestamp,
            resourceName
        );
    }

    function removeResourceFromUser(string calldata ebsiDID, bytes32 resourceName, bytes32[] memory newResourcesNames) external override {
        users[ebsiDID].resourcesHashes = newResourcesNames;
        delete userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourceName)];

        emit UserUpdated(
            'updated-resource-removed',
            ebsiDID,
            block.timestamp,
            resourceName
        );
    }

    // RESOURCES FUNCTIONS
    // Get a resource by passing its ID
    function getResource(
        bytes32 resourceHash
    ) external view override returns (Resource memory) {
        return resourceIDToResourceData[resourceHash];
    }

    // Check if a resource has already been created and if so it will return that resource
    function isResourceAlreadyCreated(
        bytes32 name
    ) external override returns (bool) {
        if (existingResources[name]) {
            emit CustomError("User already in blacklist!");
        }
        return existingResources[name];
    }

    // Create a resource passing a name
    function createResource(
        bytes32 name
        // string calldata ebsiDID
    ) external override returns (bytes32 resourceHash) {
        require(
            !this.isResourceAlreadyCreated(name),
            "Resource already existing with this name!"
        );
        resourceIDToResourceData[name] = Resource({
            name: name,
            blacklist: new string[](0)
        });
        existingResources[name] = true;
        createdResourcesArray.push(name);

        // if (bytes(ebsiDID).length != 0) {
        //     users[ebsiDID].resourcesHashes.push(name);
        //     userResourceToRoleData[
        //         createResourceToRoleHash(ebsiDID, name)
        //     ] = roles["admin"];

        //     // emit UserUpdated(
        //     //     ''
        //     //     block.timestamp,
        //     //     ebsiDID,
        //     //     "",
        //     //     "",
        //     //     ""
        //     // );
        // }

        emit ResourceUpdated("creation", name, block.timestamp, "", false);
        return name;
    }

    // Here you cannot remove the resource from each user during this function because it could run out of gas
    // Then at the next user edit, the resource will be removed from him
    function deleteResource(
        bytes32 name,
        bytes32[] memory newCreatedResourcesArray
    ) external override {
        createdResourcesArray = newCreatedResourcesArray;
        existingResources[name] = false;
        delete resourceIDToResourceData[name];
        emit ResourceUpdated("deletion", name, block.timestamp, "", false);
    }

    function getAllResourcesInBytes32()
        external
        view
        override
        returns (bytes32[] memory)
    {
        return createdResourcesArray;
    }

    // Get all the resources createcd - cycling through the entire list of UIDs
    function getAllResources()
        external
        view
        override
        returns (Resource[] memory)
    {
        Resource[] memory tempResources = new Resource[](
            createdResourcesArray.length
        );
        uint tempResourcesCounter = 0;
        if (createdResourcesArray.length > 0) {
            for (uint256 i = 0; i < createdResourcesArray.length; i++) {
                tempResources[tempResourcesCounter] = resourceIDToResourceData[
                    createdResourcesArray[i]
                ];
                tempResourcesCounter++;
            }
        }
        return tempResources;
    }

    // Get all user resources
    function getAllUserResources(
        string calldata ebsiDID
    ) external view override returns (Resource[] memory) {
        uint tempResourcesCounter = 0;
        bytes32[] memory resourcesHashes = users[ebsiDID].resourcesHashes;
        Resource[] memory tempResources = new Resource[](
            resourcesHashes.length
        );
        if (resourcesHashes.length > 0) {
            for (uint256 i = 0; i < resourcesHashes.length; i++) {
                tempResources[tempResourcesCounter] = resourceIDToResourceData[
                    resourcesHashes[i]
                ];
                tempResourcesCounter++;
            }
        }
        return tempResources;
    }

    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(
        string calldata ebsiDID,
        bytes32 resourceHash
    ) external view override returns (string[] memory tempUsers) {
        require(this.checkPermission(ebsiDID, resourceHash, Data.read));

        return resourceIDToResourceData[resourceHash].blacklist;
    }

    // Add a user to a resource's blacklist
    function addUserToBlackList(
        string calldata requester,
        string calldata ebsiDID,
        bytes32 resourceUID
    ) external override {
        require(
            this.checkPermission(requester, resourceUID, Data.edit),
            "User does not have enough permission to do this action."
        );
        require(this.isUserAlreadyCreated(ebsiDID, true));
        Resource storage resource = resourceIDToResourceData[resourceUID];
        require(isUserAlreadyInBlacklist(ebsiDID, resource));
        
        resource.blacklist.push(ebsiDID);
        blacklistMapping[
            Utilities.createStringHashFrom2Args(ebsiDID, resourceUID)
        ] = true;
        bytes32 resourceName = resource.name;

        emit ResourceUpdated(
            "blacklist-user-added",
            resourceName,
            block.timestamp,
            ebsiDID,
            true
        );
    }

    // Remove a user from a resource's blacklist
    function removeUserFromBlacklist(
        string calldata requester,
        string calldata ebsiDID,
        bytes32 resourceUID,
        string[] memory newBlacklist
    ) external override {
        require(
            this.checkPermission(requester, resourceUID, Data.edit),
            "User does not have enough permission to do this action."
        );
        require(this.isUserAlreadyCreated(ebsiDID, true));
        Resource storage resource = resourceIDToResourceData[resourceUID];
        resource.blacklist = newBlacklist;
        blacklistMapping[
            Utilities.createStringHashFrom2Args(ebsiDID, resourceUID)
        ] = false;
        bytes32 resourceName = resourceIDToResourceData[resourceUID].name;
        emit ResourceUpdated(
            "blacklist-user-removed",
            resourceName,
            block.timestamp,
            ebsiDID,
            false
        );
    }

    // ROLES FUNCTIONS
    // Get all roles available created by the admins
    function getAllAvailableRoles()
        external
        view
        override
        returns (Role[] memory)
    {
        Role[] memory availableRoles = new Role[](createdRolesArray.length);
        uint availableRolesCounter = 0;
        if (availableRoles.length > 0) {
            for (uint256 i = 0; i < createdRolesArray.length; i++) {
                availableRoles[availableRolesCounter] = roles[
                    createdRolesArray[i]
                ];
                availableRolesCounter++;
            }
        }
        return availableRoles;
    }

    // Get a role from the mapping
    function getRole(
        bytes32 roleID
    ) external view override returns (Role memory) {
        return roles[roleID];
    }

    // Only callable from who has grant permission - It shows before which role user have and ask for permission before submitting this request
    function assignRole(
        string calldata requester,
        string calldata ebsiDID,
        bytes32 resourceUID,
        Role calldata role
    ) external override {
        require(
            this.checkPermission(requester, resourceUID, Data.grant),
            "User does not have enough permissions to do this action."
        );

        User memory user = users[ebsiDID];
        int256 resourceIndex = -1;
        for (uint256 i = 0; i < user.resourcesHashes.length; i++) {
            if (resourceUID == user.resourcesHashes[i]) {
                resourceIndex = int256(i);
            }
        }
        if (resourceIndex >= 0) {
            // Need to use this instead of the variable because here it's needed to assign the new value to the storage variable
            users[ebsiDID].resourcesHashes.push(resourceUID);
        }

        // Not finding a way to limit a bug where an user can revoke a role to a resource by simply assigning a role with less permissions
        userResourceToRoleData[
            createResourceToRoleHash(ebsiDID, resourceUID)
        ] = role;
    }

    // Only callable from who has revoke permissions
    function revokeRole(
        string calldata requester,
        string calldata ebsiDID,
        bytes32 resourceUID
    ) external override {
        require(
            this.checkPermission(requester, resourceUID, Data.revoke),
            "User does not have enough permissions to do this action."
        );
        User memory user = users[ebsiDID];
        if (user.resourcesHashes.length > 0) {
            int256 resourceIndex = -1;
            for (uint256 i = 0; i < user.resourcesHashes.length; i++) {
                if (resourceUID == user.resourcesHashes[i]) {
                    resourceIndex = int256(i);
                }
            }
            if (resourceIndex >= 0) {
                for (
                    uint256 j = uint256(resourceIndex);
                    j < user.resourcesHashes.length;
                    j++
                ) {
                    users[ebsiDID].resourcesHashes[j] = users[ebsiDID]
                        .resourcesHashes[j + 1];
                }
                users[ebsiDID].resourcesHashes.pop();
            }
            // Need to use this instead of the variable because here it's needed to assign the new value to the storage variable
            delete userResourceToRoleData[
                createResourceToRoleHash(ebsiDID, resourceUID)
            ];
        }
    }

    // Check whether the role has been already created
    function isRoleAlreadyCreated(
        bytes32 roleName
    ) external override returns (bool) {
        if(existingRoles[roleName]) {
            emit CustomError("Role already exists!");
        }
        return existingRoles[roleName];
    }

    // Create a custom role with permissions (usefull if admin has created custom permissions or else)
    function createCustomRole(
        bytes32 roleName,
        bytes32[] calldata permissions
    ) external override {
        require(!this.isRoleAlreadyCreated(roleName));
        roles[roleName] = Role({
            permissions: new bytes32[](permissions.length),
            name: roleName,
            isCustom: true
        });
        for (uint256 i = 0; i < permissions.length; i++) {
            roles[roleName].permissions.push(permissions[i]);
        }
        createdRolesArray.push(roleName);
        existingRoles[roleName] = true;
        emit UpdatedRole("creation", roles[roleName], block.timestamp);
    }

    // Delete a custom role
    function deleteCustomRole(
        bytes32[] memory newCreatedRolesArray,
        bytes32 roleName
    ) external override {
        if(roles[roleName].isCustom) {
            Role memory oldRole = Role({
                name: roleName,
                permissions: new bytes32[](0),
                isCustom: true
            });
            createdRolesArray = newCreatedRolesArray;
            existingRoles[roleName] = false;
            delete roles[roleName];
            emit UpdatedRole("deletion", oldRole, block.timestamp);
        }
    }

    // Returns the entire created permissions array in bytes32 for internal purpouse
    function getAllRolesInBytes32()
        external
        view
        override
        returns (bytes32[] memory)
    {
        return createdRolesArray;
    }

    // PERMISSIONS FUNCTIONS
    // Get all the available permissions (usefull for a dropdown to choose from) - cycling through entire availablePermissions list
    function getAllAvailablePermissions()
        external
        view
        override
        returns (PermissionStruct[] memory)
    {
        uint permissionsLength = createdPermissionsArray.length;
        PermissionStruct[] memory availablePermissions = new PermissionStruct[](
            permissionsLength
        );
        uint availablePermissionsCounter = 0;
        if (permissionsLength > 0) {
            for (uint i = 0; i < permissionsLength; i++) {
                availablePermissions[
                    availablePermissionsCounter
                ] = permissionIDToPermissionData[createdPermissionsArray[i]];
                availablePermissionsCounter++;
            }
        }
        return availablePermissions;
    }

    function getPermission(
        bytes32 permissionID
    ) external view override returns (PermissionStruct memory) {
        return permissionIDToPermissionData[permissionID];
    }

    // Check if a permission already exists
    function isPermissionAlreadyCreated(
        bytes32 permissionName
    ) external override returns (bool) {
        if(existingPermissions[permissionName]) {
            emit CustomError("Permission already exists!");
        }
        return existingPermissions[permissionName];
    }

    // Create a custom permission (usefull for creating then a custom role)
    function createCustomPermission(bytes32 name) external override {
        require(!this.isPermissionAlreadyCreated(name));
        permissionIDToPermissionData[name] = PermissionStruct({
            permission: name,
            isCustom: true
        });
        createdPermissionsArray.push(name);
        existingPermissions[name] = true;
        emit UpdatedPermission(
            "creation",
            permissionIDToPermissionData[name],
            block.timestamp
        );
    }

    // Returns the entire created permissions array in bytes32 for internal purpouse
    function getAllPermissionsInBytes32()
        external
        view
        override
        returns (bytes32[] memory)
    {
        return createdPermissionsArray;
    }

    // Delete a custom permission - Cannot put here more than this operation because it would exceed the maximum gas fee
    function deleteCustomPermission(
        bytes32[] calldata newCreatedPermissionsArray,
        bytes32 name
    ) external override {
        PermissionStruct memory oldPermission = PermissionStruct({
            permission: name,
            isCustom: true
        });
        createdPermissionsArray = newCreatedPermissionsArray;
        existingPermissions[name] = false;
        delete permissionIDToPermissionData[name];
        emit UpdatedPermission("deletion", oldPermission, block.timestamp);
    }
}
