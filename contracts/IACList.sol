// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './Data.sol';

/**
 * @title IACList
 */
abstract contract IACList is Data {

    // Check whether the user has the permission or not
    function checkPermission(bytes32 _resourceID, bytes32 _ebsiDID, bytes32 _permission) external virtual view returns (bool);


    // USERS FUNCTIONS
    // Passing a name will create a new resource - passing name to keccak to have a uniqueID, the struct also have a blacklist
    function createUser(bytes32 ebsiDID, ResourcesRoles[] calldata resourcesRoles) external virtual returns (User memory user);
    // RemoveUser from the blockchain (from now on using delete)
    function removeUser(bytes32 ebsiDID) external virtual returns (bool);
    // Get a single user by his ebsiDID
    function getUser(bytes32 ebisDID) external virtual view returns (User memory);
    // Check if user has already been created, using an ebsiDID and cycling through the entire list of created users (only ebsiDID must be stored)
    function isUserAlreadyCreated(bytes32 ebsiDID) external virtual view returns (bool);
    // Get all Roles of a user
    function getAllUserRoles(bytes32 ebsiDID) external virtual view returns (ResourcesRoles[] memory) ;
    // Get all the users (cycle through the entire list of users, returning al ist of ebsiDID)
    function getAllUsers() external virtual view returns (User[] memory);
    // Add a user to a resource's blacklist
    function addUserToBlackList(bytes32 requester, bytes32 ebsiDID, bytes32 uniqueID) external virtual;
    // Remove a user from a resource's blacklist
    function removeUserFromBlacklist(bytes32 requester, bytes32 ebsiDID, bytes32 uniqueID) external virtual;
    // Get all users in a resource's blacklist
    function getAllUsersInBlacklist(bytes32 requester, bytes32 resourceID) external view virtual returns (bytes32[] calldata users);
    // Add resources to the passed user
    function removeResourcesFromUser(bytes32 ebsiDID, bytes32[] calldata resourcesUIDs) external virtual;
    // Remove resources to the passed user
    function addResourcesToUser(bytes32 ebsiDID, bytes32[] calldata resourcesUIDs) external virtual;


    // ROLES FUNCTIONS
    // Only callable from who has grant permission
    function assignRole(bytes32 requester, bytes32 ebsiDID, bytes32 resourceUID, Role calldata role) external virtual;
    // Only callable from who has revoke permissions
    function revokeRole(bytes32 requester, bytes32 ebsiDID, bytes32 resourceUID) external virtual;
    // Create a custom role with permissions (usefull if admin has created custom permissions or else)
    function createCustomRole(Role calldata role) external virtual;
    // Delete a custom role
    function deleteCustomRole(bytes32 roleID) external virtual;
    // Get all roles available created by the admins
    function getAllAvailableRoles() external virtual view returns (Role[] memory responseRoles);
    // Check whether the role has been already created
    function isRoleAlreadyCreated(bytes32 roleID) external virtual view returns (bool); 


    // PERMISSIONS FUNCTIONS
    // Get all the available permissions (usefull for a dropdown to choose from) - cycling through entire availablePermissions list
    function getAllAvailablePermissions() external virtual view returns (PermissionStruct[] memory respondePermissions);
    // Create a custom permission (usefull for creating then a custom role)
    function createCustomPermission(PermissionStruct calldata permission) external virtual;
    // Delete a custom permission
    function deleteCustomPermission(bytes32 permissionName) external virtual;
    // Check if a permission already exists
    function isPermissionAlreadyCreated(bytes32 permissionName) external virtual view returns (bool);



    // RESOURCES FUNCTIONS
    // Create a resource passing a name
    function createResource(bytes32 requester, bytes32 name) external virtual returns (bytes32 resourceUID);
    // Delete a resource passing a UID
    function deleteResource(bytes32 resourceHash) external virtual returns (bool isJobDone);
    // Check if a resource has already been created and if so it will return that resource
    function isResourceAlreadyCreated(bytes32 name) external virtual view returns (bool);
    // Get all the resources createcd - cycling through the entire list of UIDs
    function getAllResources() external virtual view returns (Resource[] memory resources);
    // Get all user resources
    function getAllUserResources(bytes32 ebsiDID) external virtual view returns (Resource[] memory resources);
}