// BASE TYPES
export type GENERAL_DATA_TYPE = 'general';
export type USERS_DATA_TYPE = 'users';
export type RESOURCES_DATA_TYPE = 'resources';
export type ROLES_DATA_TYPE = 'roles';
export type PERMISSIONS_DATA_TYPE = 'permissions';

export type DATA_TYPE = 
  GENERAL_DATA_TYPE |
  USERS_DATA_TYPE |
  RESOURCES_DATA_TYPE |
  ROLES_DATA_TYPE |
  PERMISSIONS_DATA_TYPE |
  null;