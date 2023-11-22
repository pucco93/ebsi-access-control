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
    function checkPermission(string calldata _ebsiDID, string calldata _resourceID, bytes32 _permission) external virtual view override returns (bool) {
        Role storage _userRole = userResourceToRoleData[string.concat(_ebsiDID, _resourceID)];
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
    function createUser(string calldata ebsiDID, ResourcesRoles[] calldata resourcesRoles) external override returns (User memory user) {
        string[] memory resourcesUIDs;
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
            userResourceToRoleData[string.concat(ebsiDID, resourcesUIDs[i])] = resourcesRoles[i].role;
        }

        emit UserAdded(ebsiDID, block.timestamp, block.timestamp);
        return users[ebsiDID];
    }
    
    // Remove user from the blockchain (from now on using delete)
    function removeUser(string calldata ebsiDID, string calldata resourceUID) external override returns (bool) {
        int userIndex = -1;
        for(uint i = 0; i < usersArray.length - 1; i++) {
            if(compareStrings(usersArray[i], ebsiDID)) {
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
    function getUser(string calldata ebsiDID) external override view returns (User memory user) {
        for(uint i = 0; i < usersArray.length - 1; i++) {
            if(compareStrings(usersArray[i], ebsiDID)) {
                return users[ebsiDID];
            }
        }
        emit UserNotFound("User has not been found");
        return users[ebsiDID];
    }

    // Check if user has already been created, using an ebsiDID and cycling through the entire list of created users (only ebsiDID must be stored)
    function isUserAlreadyCreated(string calldata ebsiDID) external override pure returns (bool) {
        for(uint i = 0; i < usersArray.length - 1; i++) {
            if(compareStrings(usersArray[i], ebsiDID)) {
                return true;
            }
        }
        return false;
    }

    // Get all Roles of a user
    function getAllUserRoles(string calldata ebsiDID) external override view returns (ResourcesRoles[] memory) {
        string[] memory resourcesUIDs = users[ebsiDID].resourcesUIDs;
        ResourcesRoles[] memory resourcesRoles = new ResourcesRoles[](resourcesUIDs.length);

        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            resourcesRoles[i] = ResourcesRoles({
                role: userResourceToRoleData[string.concat(ebsiDID, resourcesUIDs[i])],
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
    function isUserAlreadyInBlacklist(string calldata ebsiDID, string[] memory list) internal pure returns (bool) {
        for(uint i = 0; i < list.length - 1; i++) {
            if(compareStrings(ebsiDID, list[i])) {
                return true;
            }
        }

        return false;
    }

    // Add a user to a resource's blacklist
    function addUserToBlackList(string calldata requester, string calldata ebsiDID, string calldata resourceUID) external override {
        require(this.checkPermission(requester, resourceUID, Data.edit), "User does not have enough permission to do this action.");
        Resource storage  resource = resourceIDToResourceData[resourceUID];
        require(isUserAlreadyInBlacklist(ebsiDID, resource.blacklist), "User is already in blacklist");
        resource.blacklist.push(ebsiDID);
        string memory resourceName = resource.name;

        emit ResourceUpdated(block.timestamp, resourceName, ebsiDID, true);
    }

    // Remove a user from a resource's blacklist
    function removeUserFromBlacklist(string calldata requester, string calldata ebsiDID, string calldata resourceUID) external override {
        require(this.checkPermission(requester, resourceUID, Data.edit), "User does not have enough permission to do this action.");
        int userIndex = -1;
        string[] storage blacklist = resourceIDToResourceData[resourceUID].blacklist;
        for(uint i = 0; i < blacklist.length - 1; i++) {
            if(compareStrings(blacklist[i], ebsiDID)) {
                userIndex = int256(i);
            }
        }
        require(int256(userIndex) >= 0, "User not found in blacklist, maybe it's already been removed");
        for (uint i = uint(userIndex); i < blacklist.length - 1; i++) {
            blacklist[i] = blacklist[i + 1];
        }
        blacklist.pop();
        string memory resourceName = resourceIDToResourceData[resourceUID].name;
        emit ResourceUpdated(block.timestamp, resourceName, ebsiDID, false);
    }

    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(string calldata requester, string calldata resourceUID) external override returns (string[] memory users) {
        require(this.checkPermission(requester, resourceUID, Data.read), "User does not have enough permission to do this action.");
        string[] memory tempUsers;
        string[] memory blacklistedUsers = resourceIDToResourceData[resourceUID].blacklist;
        for(uint i = 0; i < blacklistedUsers.length - 1; i++) {
            tempUsers[i] = blacklistedUsers[i];
        }

        return tempUsers;
    }

    function addResourcesToUser(string calldata ebsiDID, string[] calldata resourcesUIDs) external override {
        string[] memory resourcesNames;
        string[] memory removedResource = new string[](0);
        string[] memory resourcesWithProblems = new string[](0);
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            // trova le risorse
            users[ebsiDID].resourcesUIDs.push(resourcesUIDs[i]);
            resourcesNames[resourcesNames.length] = resourceIDToResourceData[resourcesUIDs[i]].name;
        }
        emit UserUpdated(block.timestamp, ebsiDID, resourcesNames,  removedResource, resourcesWithProblems);
    }

    function removeResourcesFromUser(string calldata ebsiDID, string[] calldata resourcesUIDs) external override {
        string[] memory resourcesWithProblems;
        string[] memory userResourcesUIDs = users[ebsiDID].resourcesUIDs;
        string[] memory removedResources;
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            int resourceIndex = -1;
            string memory resourceName = resourceIDToResourceData[resourcesUIDs[i]].name;
            for(uint j = 0; j < userResourcesUIDs.length - 1; j++) {
                if(compareStrings(userResourcesUIDs[j], resourcesUIDs[i])) {
                    resourceIndex = int256(j);
                }
            }
            if(resourceIndex >= 0) {
                for (uint j = uint(resourceIndex); j < userResourcesUIDs.length - 1; j++) {
                    userResourcesUIDs[j] = userResourcesUIDs[j + 1];
                }
                users[ebsiDID].resourcesUIDs.pop();
                delete userResourceToRoleData[string.concat(ebsiDID, resourcesUIDs[i])];
                removedResources[removedResources.length] = resourceName;
            } else {
                resourcesWithProblems[resourcesWithProblems.length] = resourceName;
            }
        }

        emit UserUpdated(block.timestamp, ebsiDID, new string[](0), removedResources, resourcesWithProblems);
    }


    // RESOURCES FUNCTIONS
    // Create a resource passing a name
    function createResource(string calldata requester, string calldata name) external override returns (string memory resourceUID) {
        string memory resourceUIDToCreate = createStringHash(name);
        users[requester].resourcesUIDs.push(resourceUIDToCreate);
        userResourceToRoleData[string.concat(requester, resourceUIDToCreate)] = roles["admin"];

        emit UserUpdated(block.timestamp, requester, new string[](0), new string[](0), new string[](0));
        emit ResourceUpdated(block.timestamp, name, requester, false);
        return resourceUIDToCreate;
    }

    function deleteResource(string calldata resourceHash) external virtual override returns (bool) {
        // Deleting a resource from a user resourceUIDs array is not doable because of max gas consumption when users are a relevant number
        // This can reach the max because it should cycle through entire usersArray and then cycle through entire resourceUIDs array for each user
        // This lead to remove the resourceUID from the user
        int resourceIndex = -1;
        for(uint i = 0; i < createdResourcesArray.length; i++) {
            if(compareStrings(resourceHash, createdResourcesArray[i])) {
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
                if(compareStrings(resourceHash, users[usersArray[i]].resourcesUIDs[j])) {
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
        delete resourceIDToResourceData[resourceHash];
    }

    // Check if a resource has already been created and if so it will return that resource
    function isResourceAlreadyCreated(string calldata name) external override pure returns (bool) {
        string memory resourceUIDToCreate = createStringHash(name);
        for(uint i = 0; i < createdResourcesArray.length - 1; i++) {
            if(compareStrings(createdResourcesArray[i], resourceUIDToCreate)) {
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
    function getAllUserResources(string calldata ebsiDID) external override view returns(Resource[] memory tempResources) {
        string[] memory resourcesUIDs = users[ebsiDID].resourcesUIDs;
        for(uint i = 0; i < resourcesUIDs.length - 1; i++) {
            tempResources[tempResources.length] = resourceIDToResourceData[resourcesUIDs[i]];
        }
        return tempResources;
    }


    // ROLES FUNCTIONS
    // Only callable from who has grant permission - It shows before which role user have and ask for permission before submitting this request
    function assignRole(string calldata requester, string calldata ebsiDID, string calldata resourceUID, Role calldata role) external override {
        require(this.checkPermission(requester, resourceUID, Data.grant), "User does not have enough permissions to do this action.");

        User memory user = users[ebsiDID];
        int resourceIndex = -1;
        for(uint i = 0; i < user.resourcesUIDs.length - 1; i++) {
            if(compareStrings(resourceUID, user.resourcesUIDs[i])) {
                resourceIndex = int256(i);
            }
        }
        if(resourceIndex >= 0) {
            // Need to use this instead of the variable because here it's needed to assign the new value to the storage variable
            users[ebsiDID].resourcesUIDs.push(resourceUID);
        }

        // Not finding a way to limit a bug where an user can revoke a role to a resource by simply assigning a role with less permissions
        userResourceToRoleData[string.concat(ebsiDID, resourceUID)] = role;
    }

    // Only callable from who has revoke permissions
    function revokeRole(string calldata requester, string calldata ebsiDID, string calldata resourceUID) external override {
        require(this.checkPermission(requester, resourceUID, Data.revoke), "User does not have enough permissions to do this action.");
        User memory user = users[ebsiDID];
        int resourceIndex = -1;
        for(uint i = 0; i < user.resourcesUIDs.length - 1; i++) {
            if(compareStrings(resourceUID, user.resourcesUIDs[i])) {
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
        delete userResourceToRoleData[string.concat(ebsiDID, resourceUID)];
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
    function deleteCustomRole(string calldata roleName) external override {
        int resourceIndex = -1;
        for(uint i = 0; i < createdRolesArray.length; i++) {
            if(compareStrings(roleName, createdRolesArray[i])) {
                resourceIndex = int256(i);
            }
        }
        for(uint i = uint(resourceIndex); i < createdRolesArray.length; i++) {
            createdRolesArray[i] = createdRolesArray[i + 1];
        }
        createdRolesArray.pop();
        delete roles[roleName];
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
    function isRoleAlreadyCreated(string calldata roleName) external override pure returns (bool) {
        for(uint i = 0; i < createdRolesArray.length; i++) {
            if(compareStrings(roleName, createdRolesArray[i])) {
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
    function isPermissionAlreadyCreated(bytes32 permissionName) external virtual pure override returns (bool) {
        for(uint i = 0; i < createdPermissionsArray.length; i++) {
            if(permissionName == createdPermissionsArray[i]) {
                return true;
            }
        }
        return false;
    }
}