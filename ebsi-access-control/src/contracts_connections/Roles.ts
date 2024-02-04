import { INVALID_BYTES_32 } from "../constants/Constants";
import useAlert from "../hooks/useAlert";
import { setCreatedRole, setDeletedRole, setRoles, setRolesHashes } from "../store/accessControlListStore";
import { store } from "../store/store";
import { fromBytes32ToString, fromStringToBytes32 } from "../utilities/utilities";
import { contract } from "./ContractsConnections";

export const formatRole = ({name, isCustom, permissions}: any): Role => ({
  name: fromBytes32ToString(name),
  isCustom,
  permissions: permissions.map((permission: string) => fromBytes32ToString(permission))
});

export const formatRoles = (response: any[]): Role[] => 
  response.map(item => formatRole(item));

export const listenForRoles = () => {
  try {
    if (contract) {
      contract.events.UpdatedRole()
        .on('data', (event: any) => {
          const { roles, rolesHashes } = store.getState().accessControlList || {};
          switch (event?.returnValues?.eventType) {
            case "creation": {
              const formattedRole = formatRole(event?.returnValues?.role);
              if(!roles.some((role: Role) => role.name === formattedRole.name)) {
                store.dispatch(setCreatedRole({ status: "success", role: formattedRole }));
                store.dispatch(setRoles([...roles, formattedRole]));
                store.dispatch(setRolesHashes([...rolesHashes, event?.returnValues?.role.role]));
              }

              break;
            }
            case 'deletion': {
              const formattedRole = formatRole(event?.returnValues?.role);
              store.dispatch(setDeletedRole({ status: "success", role: formattedRole }));
              store.dispatch(setRoles(roles.filter(item => item.name !== fromBytes32ToString(event?.returnValues?.role.role))));
              store.dispatch(setRolesHashes(rolesHashes.filter(item => item !== event?.returnValues?.role.role)));

              break;
            }
            default: {
              requestRoles();
            }
          }
        });
    }
  } catch (error) {
    console.error(`Due to error: ${error}, role event listener has not been initialized.`);
  }
};

export const requestRolesHashes = async () => {
  const { connectedAccount } = store.getState().accessControlList || {};

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllRolesInBytes32().call({ from: connectedAccount });
      store.dispatch(setRolesHashes(response));
      return;
    }
  } catch (error) {
    console.log(error);
    useAlert("Something went wrong!", "red");
  }
  store.dispatch(setRolesHashes([]));
};

export const requestRoles = async () => {
  const { connectedAccount } = store.getState().accessControlList || {};

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllAvailableRoles().call({ from: connectedAccount });
      const formattedRoles = formatRoles(response);
      store.dispatch(setRoles(formattedRoles));
      return;
    }
  } catch (error) {
    console.log(error);
    useAlert("Something went wrong!", "red");
  }
  store.dispatch(setRoles([]));
};

export const requestRole = async (roleName: string) => {
  const { connectedAccount } = store.getState().accessControlList || {};
  
  try {
    if (contract) {
      const roleID = fromStringToBytes32(roleName);
      const response = await contract?.methods.getRole(roleID).call({ from: connectedAccount });
      const roleResults = response?.role !== INVALID_BYTES_32 ? [formatRole(response)] : []
      store.dispatch(setRoles(roleResults));
      return;
    }
  } catch (error) {
    console.error(error);
    useAlert("Something went wrong!", "red");
  }
};

export const requestCreateRole = async (name: string, permissions: string[]) => {
  const connectedAccount = store.getState().accessControlList.connectedAccount;
  const translatedName = fromStringToBytes32(name);

  try {
    if (contract) {
      await contract?.methods.createCustomRole(translatedName, permissions).send({ from: connectedAccount });
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setCreatedRole({ status: "error", role: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to create role: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};

export const requestDeleteRole = async (name: string) => {
  const { rolesHashes, connectedAccount } = store.getState().accessControlList || {};
  const translatedName: string = fromStringToBytes32(name);
  const newCreatedRolesArray: string[] = rolesHashes.filter((item: string) => item !== translatedName);

  try {
    if (contract) {
      await contract?.methods.deleteCustomRole(newCreatedRolesArray, translatedName).send({ from: connectedAccount });
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setDeletedRole({ status: "error", permission: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to delete role: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};