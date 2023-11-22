// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './Data.sol';

/**
 * @title IACList
 */
abstract contract IACList is Data {

    // Check whether the user has the permission or not
    function checkPermission(string calldata _resourceID, string calldata _ebsiDID, bytes32 _permission) external virtual view returns (bool);


    // USERS FUNCTIONS
    // Passing a name will create a new resource - passing name to keccak to have a uniqueID, the struct also have a blacklist
    function createUser(string calldata ebsiDID, ResourcesRoles[] calldata resourcesRoles) external virtual returns (User memory user);
    // RemoveUser from the blockchain (from now on using delete)
    function removeUser(string calldata ebsiDID, string calldata resourceUID) external virtual returns (bool);
    // Get a single user by his ebsiDID
    function getUser(string calldata ebisDID) external virtual view returns (User memory);
    // Check if user has already been created, using an ebsiDID and cycling through the entire list of created users (only ebsiDID must be stored)
    function isUserAlreadyCreated(string calldata ebsiDID) external virtual pure returns (bool);
    // Get all Roles of a user
    function getAllUserRoles(string calldata ebsiDID) external virtual view returns (ResourcesRoles[] memory) ;
    // Get all the users (cycle through the entire list of users, returning al ist of ebsiDID)
    function getAllUsers() external virtual view returns (User[] memory);
    // Add a user to a resource's blacklist
    function addUserToBlackList(string calldata requester, string calldata ebsiDID, string calldata uniqueID) external virtual;
    // Remove a user from a resource's blacklist
    function removeUserFromBlacklist(string calldata requester, string calldata ebsiDID, string calldata uniqueID) external virtual;
    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(string calldata requester, string calldata resourceID) external virtual returns (string[] calldata users);
    // Add resources to the passed user
    function removeResourcesFromUser(string calldata ebsiDID, string[] calldata resourcesUIDs) external virtual;
    // Remove resources to the passed user
    function addResourcesToUser(string calldata ebsiDID, string[] calldata resourcesUIDs) external virtual;


    // ROLES FUNCTIONS
    // Only callable from who has grant permission
    function assignRole(string calldata requester, string calldata ebsiDID, string calldata resourceUID, Role calldata role) external virtual;
    // Only callable from who has revoke permissions
    function revokeRole(string calldata requester, string calldata ebsiDID, string calldata resourceUID) external virtual;
    // Create a custom role with permissions (usefull if admin has created custom permissions or else)
    function createCustomRole(Role calldata role) external virtual;
    // Delete a custom role
    function deleteCustomRole(string calldata roleName) external virtual;
    // Get all roles available created by the admins
    function getAllAvailableRoles() external virtual view returns (Role[] memory responseRoles);
    // Check whether the role has been already created
    function isRoleAlreadyCreated(string calldata roleID) external virtual pure returns (bool); 


    // PERMISSIONS FUNCTIONS
    // Get all the available permissions (usefull for a dropdown to choose from) - cycling through entire availablePermissions list
    function getAllAvailablePermissions() external virtual view returns (PermissionStruct[] memory respondePermissions);
    // Create a custom permission (usefull for creating then a custom role)
    function createCustomPermission(PermissionStruct calldata permission) external virtual;
    // Delete a custom permission
    function deleteCustomPermission(bytes32 permissionName) external virtual;
    // Check if a permission already exists
    function isPermissionAlreadyCreated(bytes32 permissionName) external virtual pure returns (bool);



    // RESOURCES FUNCTIONS
    // Create a resource passing a name
    function createResource(string calldata requester, string calldata name) external virtual returns (string calldata resourceUID);
    // Delete a resource passing a UID
    function deleteResource(string calldata resourceHash) external virtual returns (bool);
    // Check if a resource has already been created and if so it will return that resource
    function isResourceAlreadyCreated(string calldata name) external virtual pure returns (bool);
    // Get all the resources createcd - cycling through the entire list of UIDs
    function getAllResources() external virtual view returns (Resource[] memory resources);
    // Get all user resources
    function getAllUserResources(string calldata ebsiDID) external virtual view returns (Resource[] memory resources);
}