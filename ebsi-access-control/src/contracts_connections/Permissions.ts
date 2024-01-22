import { store } from "../store/store";
import { setCreatedPermission, setDeletedPermission, setPermissions, setPermissionsHashes } from "../store/accessControlListStore";
import useAlert from "../hooks/useAlert";
import { contract } from "./ContractsConnections";
import { fromBytes32ToString, fromStringToBytes32 } from "../utilities/utilities";
import { INVALID_BYTES_32 } from "../constants/Constants";

export const formatPermission = ({ isCustom, permission }: any): Permission => ({
  isCustom,
  name: fromBytes32ToString(permission)
});

export const formatPermissions = (response: any[]): Permission[] => 
  response?.map(item => formatPermission(item));

export const listenForPermissions = () => {
  try {
    if (contract) {
      contract.events.UpdatedPermission()
        .on('data', (event: any) => {
          const { permissions, permissionsHashes } = store.getState().accessControlList || {};
          switch (event?.returnValues?.eventType) {
            case "creation": {
              const formattedPermission = formatPermission(event?.returnValues?.permission);
              if(!permissions.some((permission: Permission) => permission.name === formattedPermission.name)) {
                store.dispatch(setCreatedPermission({ status: "success", permission: formattedPermission }));
                store.dispatch(setPermissions([...permissions, formattedPermission]));
                store.dispatch(setPermissionsHashes([...permissionsHashes, event?.returnValues?.permission.permission]));
              }

              break;
            }
            case 'deletion': {
              const formattedPermission = formatPermission(event?.returnValues?.permission);
              store.dispatch(setDeletedPermission({ status: "success", permission: formattedPermission }));
              store.dispatch(setPermissions(permissions.filter((item: Permission) => item.name !== fromBytes32ToString(event?.returnValues?.permission.permission))));
              store.dispatch(setPermissionsHashes(permissionsHashes.filter((item: string) => item !== event?.returnValues?.permission.permission)));

              break;
            }
            default: {
              requestPermissions();
            }
          }
        });
    }
  } catch (error) {
    console.error(`Due to error: ${error}, permission event listener has not been initialized.`);
  }
};

export const requestPermissionsHashes = async () => {

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllPermissionsInBytes32().call();
      store.dispatch(setPermissionsHashes(response));
      return;
    }
  } catch (error) {
    console.log(error);
    useAlert("Something went wrong!", "red");
  }
  store.dispatch(setPermissionsHashes([]));
};

export const requestPermissions = async () => {

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllAvailablePermissions().call();
      const formattedPermissions = formatPermissions(response);
      store.dispatch(setPermissions(formattedPermissions));
      return;
    }
  } catch (error) {
    console.log(error);
    useAlert("Something went wrong!", "red");
  }
  store.dispatch(setPermissions([]));
};

export const requestPermission = async (permissionName: string) => {
  try {
    if (contract) {
      const permissionID = fromStringToBytes32(permissionName);
      const response = await contract?.methods.getPermission(permissionID).call();
      const permissionsResults = response?.permission !== INVALID_BYTES_32 ? [formatPermission(response)] : []
      store.dispatch(setPermissions(permissionsResults));
      return;
    }
  } catch (error) {
    console.error(error);
    useAlert("Something went wrong!", "red");
  }
};

export const requestCreatePermission = async (name: string) => {
  const connectedAccount = store.getState().accessControlList.connectedAccount;
  const translatedName = fromStringToBytes32(name);

  try {
    if (contract) {
      await contract?.methods.createCustomPermission(translatedName).send({ from: connectedAccount });
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setCreatedPermission({ status: "error", permission: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to create permission: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};

export const requestDeletePermission = async (name: string) => {
  const { permissionsHashes, connectedAccount } = store.getState().accessControlList || {};
  const translatedName: string = fromStringToBytes32(name);
  const newCreatedPermissionsArray: string[] = permissionsHashes.filter((item: string) => item !== translatedName);

  try {
    if (contract) {
      await contract?.methods.deleteCustomPermission(newCreatedPermissionsArray, translatedName).send({ from: connectedAccount });
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setDeletedPermission({ status: "error", permission: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to delete permission: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};