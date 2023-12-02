// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './IACList.sol';
import './Utilities.sol';

/**
 * @title AccessControlList
 */
contract AccessControlList is IACList, Utilities {
    constructor() {}

    // USERS FUNCTIONS
    // Check whether the user has the permission or not
    function checkPermission(bytes32 _ebsiDID, bytes32 _resourceID, bytes32 _permission) external virtual view override returns (bool) {
        Role storage _userRole = userResourceToRoleData[createResourceToRoleHash(_ebsiDID, _resourceID)];
        bool hasPermission = false;
        if(_userRole.permissions.length > 0) {
            for(uint i = 0; i <= _userRole.permissions.length - 1; i++) {
                if(_userRole.permissions[i] == _permission) {
                    hasPermission = true;
                }
            }
        }
        return hasPermission;
    }

    // Passing a name will create a new resource - passing name to keccak to have a uniqueID, the struct also have a blacklist
    function createUser(bytes32 ebsiDID, ResourcesRoles[] calldata resourcesRoles) external override returns (User memory user) {
        bytes32[] memory resourcesUIDs;
        for(uint i = 0; i < resourcesRoles.length; i++) {
            resourcesUIDs[resourcesUIDs.length] = resourcesRoles[i].resourceName;
        }
        users[ebsiDID] = User(
            ebsiDID,
            resourcesUIDs,
            block.timestamp,
            block.timestamp,
            0
        );
        usersArray.push(ebsiDID);
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourcesUIDs[i])] = resourcesRoles[i].role;
        }

        emit UserAdded(ebsiDID, block.timestamp, block.timestamp);
        return users[ebsiDID];
    }
    
    // Remove user from the blockchain (from now on using delete)
    function removeUser(bytes32 ebsiDID) external override returns (bool) {
        int userIndex = -1;
        for(uint i = 0; i < usersArray.length - 1; i++) {
            // if(comparebytes32s(usersArray[i], ebsiDID)) {
            if(usersArray[i] == ebsiDID) {
                userIndex = int256(i);
            }
        }
        if(userIndex == -1) {
            return false;
        }
        for (uint i = uint256(userIndex); i < usersArray.length - 1; i++) {
            usersArray[i] = usersArray[i + 1];
        }
        usersArray.pop();
        emit UserRemoved(ebsiDID, block.timestamp);
        return true;
    }

    // Get a single user by his ebsiDID
    function getUser(bytes32 ebsiDID) external override view returns (User memory user) {
        for(uint i = 0; i < usersArray.length - 1; i++) {
            // if(comparebytes32s(usersArray[i], ebsiDID)) {
            if(ebsiDID == usersArray[i]) {
                return users[ebsiDID];
            }
        }

        return users[ebsiDID];
    }

    // Check if user has already been created, using an ebsiDID and cycling through the entire list of created users (only ebsiDID must be stored)
    function isUserAlreadyCreated(bytes32 ebsiDID) external override view returns (bool) {
        for(uint i = 0; i < usersArray.length - 1; i++) {
            // if(comparebytes32s(usersArray[i], ebsiDID)) {
            if(usersArray[i] == ebsiDID) {
                return true;
            }
        }
        return false;
    }

    // Get all Roles of a user
    function getAllUserRoles(bytes32 ebsiDID) external override view returns (ResourcesRoles[] memory) {
        bytes32[] memory resourcesUIDs = users[ebsiDID].resourcesUIDs;
        ResourcesRoles[] memory resourcesRoles = new ResourcesRoles[](resourcesUIDs.length);

        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            resourcesRoles[i] = ResourcesRoles({
                role: userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourcesUIDs[i])],
                resourceName: resourceIDToResourceData[resourcesUIDs[i]].name
            });
        }
        return resourcesRoles;
    }

    // Get all the users (cycle through the entire list of users, returning al ist of ebsiDID)
    function getAllUsers() external override view returns (User[] memory tempUsers) {
        for(uint i = 0; i < usersArray.length - 1; i++) {
            tempUsers[tempUsers.length] = users[usersArray[i]];
        }

        return tempUsers;
    }

    // Check if a user is already in blacklist
    function isUserAlreadyInBlacklist(bytes32 ebsiDID, bytes32[] memory list) internal pure returns (bool) {
        for(uint i = 0; i < list.length - 1; i++) {
            // if(comparebytes32s(ebsiDID, list[i])) {
            if(ebsiDID == list[i]) {
                return true;
            }
        }

        return false;
    }

    // Add a user to a resource's blacklist
    function addUserToBlackList(bytes32 requester, bytes32 ebsiDID, bytes32 resourceUID) external override {
        require(this.checkPermission(requester, resourceUID, Data.edit), "User does not have enough permission to do this action.");
        Resource storage  resource = resourceIDToResourceData[resourceUID];
        require(isUserAlreadyInBlacklist(ebsiDID, resource.blacklist), "User is already in blacklist");
        resource.blacklist.push(ebsiDID);
        bytes32 resourceName = resource.name;

        emit ResourceUpdated(block.timestamp, resourceName, ebsiDID, true);
    }

    // Remove a user from a resource's blacklist
    function removeUserFromBlacklist(bytes32 requester, bytes32 ebsiDID, bytes32 resourceUID) external override {
        require(this.checkPermission(requester, resourceUID, Data.edit), "User does not have enough permission to do this action.");
        int userIndex = -1;
        bytes32[] storage blacklist = resourceIDToResourceData[resourceUID].blacklist;
        for(uint i = 0; i < blacklist.length - 1; i++) {
            // if(comparebytes32s(blacklist[i], ebsiDID)) {
            if(blacklist[i] == ebsiDID) {
                userIndex = int256(i);
            }
        }
        require(int256(userIndex) >= 0, "User not found in blacklist, maybe it's already been removed");
        for (uint i = uint(userIndex); i < blacklist.length - 1; i++) {
            blacklist[i] = blacklist[i + 1];
        }
        blacklist.pop();
        bytes32 resourceName = resourceIDToResourceData[resourceUID].name;
        emit ResourceUpdated(block.timestamp, resourceName, ebsiDID, false);
    }

    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(bytes32 requester, bytes32 resourceUID) external view override returns (bytes32[] memory users) {
        require(this.checkPermission(requester, resourceUID, Data.read), "User does not have enough permission to do this action.");
        bytes32[] memory tempUsers;
        bytes32[] memory blacklistedUsers = resourceIDToResourceData[resourceUID].blacklist;
        for(uint i = 0; i < blacklistedUsers.length - 1; i++) {
            tempUsers[i] = blacklistedUsers[i];
        }

        return tempUsers;
    }

    function addResourcesToUser(bytes32 ebsiDID, bytes32[] calldata resourcesUIDs) external override {
        bytes32[] memory resourcesNames;
        bytes32[] memory removedResource = new bytes32[](0);
        bytes32[] memory resourcesWithProblems = new bytes32[](0);
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            // trova le risorse
            users[ebsiDID].resourcesUIDs.push(resourcesUIDs[i]);
            resourcesNames[resourcesNames.length] = resourceIDToResourceData[resourcesUIDs[i]].name;
        }
        emit UserUpdated(block.timestamp, ebsiDID, resourcesNames,  removedResource, resourcesWithProblems);
    }

    function removeResourcesFromUser(bytes32 ebsiDID, bytes32[] calldata resourcesUIDs) external override {
        bytes32[] memory resourcesWithProblems;
        bytes32[] memory userResourcesUIDs = users[ebsiDID].resourcesUIDs;
        bytes32[] memory removedResources;
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            int resourceIndex = -1;
            bytes32 resourceName = resourceIDToResourceData[resourcesUIDs[i]].name;
            for(uint j = 0; j < userResourcesUIDs.length - 1; j++) {
                // if(comparebytes32s(userResourcesUIDs[j], resourcesUIDs[i])) {
                if((userResourcesUIDs[j] == resourcesUIDs[i])) {
                    resourceIndex = int256(j);
                }
            }
            if(resourceIndex >= 0) {
                for (uint j = uint(resourceIndex); j < userResourcesUIDs.length - 1; j++) {
                    userResourcesUIDs[j] = userResourcesUIDs[j + 1];
                }
                users[ebsiDID].resourcesUIDs.pop();
                delete userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourcesUIDs[i])];
                removedResources[removedResources.length] = resourceName;
            } else {
                resourcesWithProblems[resourcesWithProblems.length] = resourceName;
            }
        }

        emit UserUpdated(block.timestamp, ebsiDID, new bytes32[](0), removedResources, resourcesWithProblems);
    }


    // RESOURCES FUNCTIONS
    // Create a resource passing a name
    function createResource(bytes32 requester, bytes32 name) external override returns (bytes32 resourceUID) {
        // bytes32 memory resourceUIDToCreate = createbytes32Hash(name);
        bytes32 resourceUIDToCreate = createHash(name);
        users[requester].resourcesUIDs.push(resourceUIDToCreate);
        userResourceToRoleData[createResourceToRoleHash(requester, resourceUIDToCreate)] = roles["admin"];

        emit UserUpdated(block.timestamp, requester, new bytes32[](0), new bytes32[](0), new bytes32[](0));
        emit ResourceUpdated(block.timestamp, name, requester, false);
        return resourceUIDToCreate;
    }

    function deleteResource(bytes32 resourceHash) external virtual override returns (bool isJobDone) {
        // Deleting a resource from a user resourceUIDs array is not doable because of max gas consumption when users are a relevant number
        // This can reach the max because it should cycle through entire usersArray and then cycle through entire resourceUIDs array for each user
        // This lead to remove the resourceUID from the user
        int resourceIndex = -1;
        isJobDone = false;
        for(uint i = 0; i < createdResourcesArray.length; i++) {
            // if(comparebytes32s(resourceHash, createdResourcesArray[i])) {
            if((resourceHash == createdResourcesArray[i])) {
                resourceIndex = int(i);
            }
        }
        if(resourceIndex >= 0) {
            for(uint i = uint(resourceIndex); i < createdResourcesArray.length; i++) {
                createdResourcesArray[i] = createdResourcesArray[i + 1];
            }
            createdResourcesArray.pop();
        }
        for(uint i = 0; i < usersArray.length; i++) {
            int resourceInCurrentUserIndex = -1;
            for(uint j = 0; j < users[usersArray[i]].resourcesUIDs.length; j++) {
                // if(comparebytes32s(resourceHash, users[usersArray[i]].resourcesUIDs[j])) {
                if((resourceHash == users[usersArray[i]].resourcesUIDs[j])) {
                    resourceInCurrentUserIndex = int(j);
                }
            }
            if(resourceInCurrentUserIndex >= 0) {
                for(uint j = uint(resourceInCurrentUserIndex); j < users[usersArray[i]].resourcesUIDs.length; j++) {
                    users[usersArray[i]].resourcesUIDs[j] = users[usersArray[i]].resourcesUIDs[j + 1];
                }
                users[usersArray[i]].resourcesUIDs.pop();
            }
        }
        isJobDone = true;
        delete resourceIDToResourceData[resourceHash];

        return isJobDone;
    }

    // Check if a resource has already been created and if so it will return that resource
    function isResourceAlreadyCreated(bytes32 name) external override view returns (bool) {
        // bytes32 memory resourceUIDToCreate = createbytes32Hash(name);
        bytes32 resourceUIDToCreate = createHash(name);
        for(uint i = 0; i < createdResourcesArray.length - 1; i++) {
            // if(comparebytes32s(createdResourcesArray[i], resourceUIDToCreate)) {
                if((createdResourcesArray[i] == resourceUIDToCreate)) {
                return true;
            }
        }
        return false;
    }

    // Get all the resources createcd - cycling through the entire list of UIDs
    function getAllResources() external override view returns(Resource[] memory tempResources) {
        for(uint i = 0; i < createdResourcesArray.length - 1; i++) {
            tempResources[tempResources.length] = resourceIDToResourceData[createdResourcesArray[i]];
        }
        return tempResources;
    }

    // Get all user resources
    function getAllUserResources(bytes32 ebsiDID) external override view returns(Resource[] memory tempResources) {
        bytes32[] memory resourcesUIDs = users[ebsiDID].resourcesUIDs;
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            tempResources[tempResources.length] = resourceIDToResourceData[resourcesUIDs[i]];
        }
        return tempResources;
    }


    // ROLES FUNCTIONS
    // Only callable from who has grant permission - It shows before which role user have and ask for permission before submitting this request
    function assignRole(bytes32 requester, bytes32 ebsiDID, bytes32 resourceUID, Role calldata role) external override {
        require(this.checkPermission(requester, resourceUID, Data.grant), "User does not have enough permissions to do this action.");

        User memory user = users[ebsiDID];
        int resourceIndex = -1;
        for(uint i = 0; i < user.resourcesUIDs.length - 1; i++) {
            // if(comparebytes32s(resourceUID, user.resourcesUIDs[i])) {
            if(resourceUID == user.resourcesUIDs[i]) {
                resourceIndex = int256(i);
            }
        }
        if(resourceIndex >= 0) {
            // Need to use this instead of the variable because here it's needed to assign the new value to the storage variable
            users[ebsiDID].resourcesUIDs.push(resourceUID);
        }

        // Not finding a way to limit a bug where an user can revoke a role to a resource by simply assigning a role with less permissions
        userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourceUID)] = role;
    }

    // Only callable from who has revoke permissions
    function revokeRole(bytes32 requester, bytes32 ebsiDID, bytes32 resourceUID) external override {
        require(this.checkPermission(requester, resourceUID, Data.revoke), "User does not have enough permissions to do this action.");
        User memory user = users[ebsiDID];
        int resourceIndex = -1;
        for(uint i = 0; i < user.resourcesUIDs.length - 1; i++) {
            // if(comparebytes32s(resourceUID, user.resourcesUIDs[i])) {
            if(resourceUID == user.resourcesUIDs[i]) {
                resourceIndex = int256(i);
            }
        }
        if(resourceIndex >= 0) {
            for (uint j = uint(resourceIndex); j < user.resourcesUIDs.length - 1; j++) {
                users[ebsiDID].resourcesUIDs[j] = users[ebsiDID].resourcesUIDs[j + 1];
            }
            users[ebsiDID].resourcesUIDs.pop();
        }
        // Need to use this instead of the variable because here it's needed to assign the new value to the storage variable
        delete userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourceUID)];
    }

    // Create a custom role with permissions (usefull if admin has created custom permissions or else)
    function createCustomRole(Role calldata role) external override {
        roles[role.name] = Role({ permissions: new bytes32[](role.permissions.length), name: role.name, isCustom: true });
        for(uint i = 0; i < role.permissions.length; i++) {
            roles[role.name].permissions.push(role.permissions[i]);
        }
        createdRolesArray.push(role.name);
    }

    // Delete a custom role
    function deleteCustomRole(bytes32 roleID) external override {
        int resourceIndex = -1;
        for(uint i = 0; i < createdRolesArray.length; i++) {
            // if(comparebytes32s(roleName, createdRolesArray[i])) {
            if(roleID == createdRolesArray[i]) {
                resourceIndex = int256(i);
            }
        }
        for(uint i = uint(resourceIndex); i < createdRolesArray.length; i++) {
            createdRolesArray[i] = createdRolesArray[i + 1];
        }
        createdRolesArray.pop();
        delete roles[roleID];
    }

    // Get all roles available created by the admins
    function getAllAvailableRoles() external override view returns (Role[] memory tempRoles) {
        Role[] memory availableRoles = new Role[](createdRolesArray.length);
        for(uint i = 0; i < createdRolesArray.length; i++) {
            availableRoles[availableRoles.length] = roles[createdRolesArray[i]];
        }
        return availableRoles;
    }

    // Check whether the role has been already created
    function isRoleAlreadyCreated(bytes32 roleName) external override view returns (bool) {
        for(uint i = 0; i < createdRolesArray.length; i++) {
            // if(comparebytes32s(roleName, createdRolesArray[i])) {
            if(roleName == createdRolesArray[i]) {
                return true;
            }
        }
        return false;
    }

    // PERMISSIONS FUNCTIONS
    // Get all the available permissions (usefull for a dropdown to choose from) - cycling through entire availablePermissions list
    function getAllAvailablePermissions() external virtual view override returns (PermissionStruct[] memory permissions) {
        PermissionStruct[] memory availablePermissions = new PermissionStruct[](createdPermissionsArray.length);
        for(uint i = 0; i < createdPermissionsArray.length; i++) {
            availablePermissions[availablePermissions.length] = permissionIDToPermissionData[createdPermissionsArray[i]];
        }
        return availablePermissions;
    }

    // Create a custom permission (usefull for creating then a custom role)
    function createCustomPermission(PermissionStruct calldata permission) external virtual override {
        permissionIDToPermissionData[permission.permission] = PermissionStruct({ permission: createPermissionHash(permission.permission), isCustom: true });
        createdPermissionsArray.push(permission.permission);
    }

    // Delete a custom permission
    function deleteCustomPermission(bytes32 permissionName) external virtual override {
        int resourceIndex = -1;
        for(uint i = 0; i < createdPermissionsArray.length; i++) {
            if(permissionName == createdPermissionsArray[i]) {
                resourceIndex = int256(i);
            }
        }
        for(uint i = uint(resourceIndex); i < createdPermissionsArray.length; i++) {
            createdPermissionsArray[i] = createdPermissionsArray[i + 1];
        }
        createdPermissionsArray.pop();
        delete permissionIDToPermissionData[permissionName];
    }

    // Check if a permission already exists
    function isPermissionAlreadyCreated(bytes32 permissionName) external virtual view override returns (bool) {
        for(uint i = 0; i < createdPermissionsArray.length; i++) {
            if(permissionName == createdPermissionsArray[i]) {
                return true;
            }
        }
        return false;
    }
}