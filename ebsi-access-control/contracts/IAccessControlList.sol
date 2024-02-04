// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import './Data.sol';

/**
 * @title IAccessControlList
 */
abstract contract IAccessControlList is Data {

    // Check whether the user has the permission or not
    function checkPermission(string calldata _ebsiDID, bytes32 _resourceID, bytes32 _permission) external virtual returns (bool);


    // USERS FUNCTIONS
    // Passing a name will create a new resource - passing name to keccak to have a uniqueID, the struct also have a blacklist
    function createUser(string calldata ebsiDID) external virtual returns (User memory user);
    // RemoveUser from the blockchain (from now on using delete)
    function removeUser(string calldata ebsiDID, string[] memory newUsersArray) external virtual returns (bool);
    // Get a single user by his ebsiDID
    function getUser(string calldata ebisDID) public virtual view returns (User memory);
    // Check if user has already been created, using an ebsiDID and cycling through the entire list of created users (only ebsiDID must be stored)
    function isUserAlreadyCreated(string calldata ebsiDID, bool skipSendEvent) external virtual returns (bool);
    // Get all Roles of a user
    function getAllUserRoles(string calldata ebsiDID) external virtual view returns (ResourcesRoles[] memory) ;
    // Get all the users (cycle through the entire list of users, returning al ist of ebsiDID)
    function getAllUsers() external virtual view returns (User[] memory);
    // Get all the ebsiDIDs created (only dids, no data)
    function getAllEbsiDIDs() external virtual view returns (string[] memory ebsiDIDs);

    // This function can be used to delete or add resources to a user with respective roles
    function updateUserResources(string calldata requester, string calldata ebsiDID, bytes32[] calldata newResourcesNames, bytes32 resourceName, Role memory role, string calldata action) external virtual;
    // User can assign new resources only if he has grant permission on resource passed, otherwise some of these won't be assiged



    // ROLES FUNCTIONS
    // Get a role from the mapping
    function getRole(bytes32 roleID) external view virtual returns (Role memory);
    // Create a custom role with permissions (usefull if admin has created custom permissions or else)
    function createCustomRole(bytes32 roleName, bytes32[] calldata permissions) external virtual;
    // Delete a custom role
    function deleteCustomRole(bytes32[] memory newCreatedRolesArray, bytes32 roleName) external virtual;
    // Get all roles available created by the admins
    function getAllAvailableRoles() external virtual view returns (Role[] memory responseRoles);
    // // Check whether the role has been already created
    function isRoleAlreadyCreated(bytes32 roleID) external virtual returns (bool);
    // Returns the entire roles array in bytes32
    function getAllRolesInBytes32() external view virtual returns (bytes32[] memory);


    // PERMISSIONS FUNCTIONS
    // Get all the available permissions (usefull for a dropdown to choose from) - cycling through entire availablePermissions list
    function getAllAvailablePermissions() external virtual view returns (PermissionStruct[] memory respondePermissions);
    // Get a permission by passing an id 
    function getPermission(bytes32 permissionID) external view virtual returns (PermissionStruct memory);
    // Create a custom permission (usefull for creating then a custom role)
    function createCustomPermission(bytes32 name) external virtual;
    // Delete a custom permission
    function deleteCustomPermission(bytes32[] calldata newCreatedPermissionsArray, bytes32 name) external virtual;
    // Check if a permission already exists
    function isPermissionAlreadyCreated(bytes32 permissionName) external virtual returns (bool);
    // Returns the entire permissions array in bytes32
    function getAllPermissionsInBytes32() external virtual view returns (bytes32[] memory);



    // RESOURCES FUNCTIONS
    // Get a resource by passing an id
    function getResource(bytes32 resourceHash) external virtual returns (Resource memory);
    // Create a resource passing a name
    function createResource(string calldata requester, bytes32 name) external virtual returns (bytes32 resourceHash);
    // Delete a resource passing a UID
    function deleteResource(string calldata requester, bytes32 resourceHash, bytes32[] memory newCreatedResourcesArray) external virtual;
    // // Check if a resource has already been created and if so it will return that resource
    function isResourceAlreadyCreated(bytes32 name) external virtual returns (bool);
    // Get all the resources hashes
    function getAllResourcesInBytes32() external virtual view returns (bytes32[] memory);
    // Get all the resources createcd - cycling through the entire list of UIDs
    function getAllResources() external virtual returns (Resource[] memory resources);
    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(string calldata requester, bytes32 resourceID) external virtual returns (string[] calldata users);
    // Update a resource's blacklist
    function updateResourceBlackList(string calldata requester, bytes32 resource, string[] calldata newBlacklist) external virtual;
}