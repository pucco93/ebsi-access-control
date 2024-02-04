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
    ) external override returns (bool) {
        Role storage _userRole = userResourceToRoleData[
            createResourceToRoleHash(_ebsiDID, _resourceID)
        ];
        uint256 permissionsArrLength = _userRole.permissions.length;
        if (permissionsArrLength > 0) {
            for (uint256 i = 0; i <= permissionsArrLength; i++) {
                if (_userRole.permissions[i] == _permission) {
                    return true;
                }
            }
        }

        emit PermissionDenied("User does not have enough permission to complete the action!");
        return false;
    }

    function userNotInBlacklist(string calldata ebsiDID, bytes32 resourceName) external view returns (bool) {
        Resource storage resource = resourceIDToResourceData[resourceName];
        if(resource.blacklist.length == 0) {
            return true;
        }
        for(uint i = 0; i < resource.blacklist.length; i++) {
            if(compareStrings(resource.blacklist[i], ebsiDID)) {
                return true;
            }
        }
        return false;
    }

    function userHasAlreadyAccount() public view returns (bool) {
        bytes memory ebsiDIDRetrieved = bytes(addressesToEbsiDID[msg.sender]);
        if (ebsiDIDRetrieved.length == 0) {
            return false;
        }

        return true;
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
        string calldata ebsiDID
    ) external override returns (User memory user) {
        require(!this.userHasAlreadyAccount());
        require(!this.isUserAlreadyCreated(ebsiDID, false));
        users[ebsiDID] = User(
            ebsiDID,
            new bytes32[](0),
            block.timestamp,
            block.timestamp,
            0
        );
        // Assign new ebsiDID to the value reached using his own address
        // This means I'm creating my account
        addressesToEbsiDID[msg.sender] = ebsiDID;
        usersArray.push(ebsiDID);
        existingUsers[ebsiDID] = true;

        emit UserUpdated("creation", ebsiDID, block.timestamp, "");
        return users[ebsiDID];
    }

    // Remove user from the blockchain (from now on using delete)
    function removeUser(
        string calldata ebsiDID,
        string[] memory newUsersArray
    ) external override returns (bool removed) {
        string memory ebsiDIDSender = this.getEbsiDID(msg.sender);
        require(compareStrings(ebsiDID, ebsiDIDSender));
        usersArray = newUsersArray;
        delete addressesToEbsiDID[msg.sender];
        existingUsers[ebsiDID] = false;
        emit UserUpdated("deletion", ebsiDID, block.timestamp, "");
        return true;
    }

    // Get all ebsiDIDs without relative users data
    function getAllEbsiDIDs()
        external
        view
        virtual
        override
        returns (string[] memory ebsiDIDs)
    {
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

    function updateUserResources(
        string calldata requester,
        string calldata ebsiDID,
        bytes32[] calldata newResourcesNames,
        bytes32 resourceName,
        Role memory role,
        string calldata action
    ) external override {
        bytes32 permission = compareStrings(string(action), string('creation'))
            ? Data.grant
            : Data.revoke;
        require(this.checkPermission(requester, resourceName, permission));
        require(this.userNotInBlacklist(ebsiDID, resourceName));
        users[ebsiDID].resourcesHashes = newResourcesNames;
        if (compareStrings(string(action), string('creation'))) {
            userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourceName)] = role;
        } else {
            delete userResourceToRoleData[createResourceToRoleHash(ebsiDID, resourceName)];
        }

        emit UserUpdated(
            compareStrings(string(action), string('creation'))
                ? "updated-resource-added"
                : "updated-resource-removed",
            ebsiDID,
            block.timestamp,
            resourceName
        );
    }

    // RESOURCES FUNCTIONS
    // Get a resource by passing its ID
    function getResource(
        bytes32 resourceHash
    ) external override returns (Resource memory) {
        if(this.checkPermission(addressesToEbsiDID[msg.sender], resourceHash, Data.read)) {
            return resourceIDToResourceData[resourceHash];
        }

        return Resource(bytes32(''), new string[](0));
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
        string calldata requester,
        bytes32 name
    )
        external
        override
        returns (
            bytes32 resourceHash
        )
    {
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
        users[requester].resourcesHashes.push(name);
        userResourceToRoleData[Utilities.createResourceToRoleHash(requester, name)] = roles[bytes32('admin')];

        emit ResourceUpdated("creation", name, block.timestamp);
        return name;
    }

    // Here you cannot remove the resource from each user during this function because it could run out of gas
    // Then at the next user edit, the resource will be removed from him
    function deleteResource(
        string calldata requester, 
        bytes32 name,
        bytes32[] memory newCreatedResourcesArray
    ) external override {
        require(this.checkPermission(requester, name, Data.deletePermission));
        createdResourcesArray = newCreatedResourcesArray;
        existingResources[name] = false;
        delete resourceIDToResourceData[name];
        emit ResourceUpdated("deletion", name, block.timestamp);
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
        override
        returns (Resource[] memory)
    {
        Resource[] memory tempResources = new Resource[](
            createdResourcesArray.length
        );
        string storage requester = addressesToEbsiDID[msg.sender];
        uint tempResourcesCounter = 0;
        if (createdResourcesArray.length > 0) {
            for (uint256 i = 0; i < createdResourcesArray.length; i++) {
                Resource storage resource  = resourceIDToResourceData[createdResourcesArray[i]];
                bool hasPermission = this.checkPermission(requester, resource.name, bytes32('read'));
                if (hasPermission) {
                    tempResources[tempResourcesCounter] = resource;
                    tempResourcesCounter++;
                }
            }
        }
        return tempResources;
    }

    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(
        string calldata ebsiDID,
        bytes32 resourceHash
    ) external override returns (string[] memory tempUsers) {
        require(this.checkPermission(ebsiDID, resourceHash, Data.read));

        return resourceIDToResourceData[resourceHash].blacklist;
    }

    // Add a user to a resource's blacklist
    function updateResourceBlackList(
        string calldata requester,
        bytes32 resource,
        string[] calldata newBlacklist
    ) external override {
        require(
            this.checkPermission(requester, resource, Data.edit),
            "User does not have enough permission to do this action."
        );
        Resource memory newResource = resourceIDToResourceData[resource];
        newResource.blacklist = newBlacklist;
        resourceIDToResourceData[resource] = newResource;

        emit ResourceUpdated(
            "blacklist-updated",
            resource,
            block.timestamp
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

    // Check whether the role has been already created
    function isRoleAlreadyCreated(
        bytes32 roleName
    ) external override returns (bool) {
        if (existingRoles[roleName]) {
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
        require(roles[roleName].isCustom);
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
        if (existingPermissions[permissionName]) {
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
        require(permissionIDToPermissionData[name].isCustom);
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
