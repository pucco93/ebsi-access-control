import { INVALID_BYTES_32 } from "../constants/Constants";
import useAlert from "../hooks/useAlert";
import { setCreatedResource, setDeletedResource, setResources, setResourcesHashes } from "../store/accessControlListStore";
import { store } from "../store/store";
import { fromBytes32ToString, fromStringToBytes32 } from "../utilities/utilities";
import { contract } from "./ContractsConnections";

export const formatResource = ({ name, blacklist }: any): Resource => ({
  name: fromBytes32ToString(name),
  blacklist: blacklist?.map((blacklistedUser: string) => fromBytes32ToString(blacklistedUser)) || []
});

export const formatResources = (response: any[]): Resource[] => 
  response.map(item => formatResource(item));

export const formatResourceEvent = (response: any): Resource => ({
  name: fromBytes32ToString(response?.name),
  blacklist: response?.isBlacklisted ? [response?.listedUser] : []
});

export const listenForResources = () => {
  try {
    if (contract) {
      contract.events.ResourceUpdated()
        .on('data', (event: any) => {
          const { resources, resourcesHashes } = store.getState().accessControlList || {};
          switch (event?.returnValues?.eventType) {
            case "creation": {
              const formattedResource = formatResourceEvent(event?.returnValues);
              if(!resources.some((resource: Resource) => resource.name === formattedResource.name)) {
                store.dispatch(setCreatedResource({ status: "success", resource: formattedResource }));
                store.dispatch(setResources([...resources, formattedResource]));
                store.dispatch(setResourcesHashes([...resourcesHashes, event?.returnValues?.name]));
              }

              break;
            }
            case 'deletion': {
              debugger;
              const formattedResource = formatResourceEvent(event?.returnValues);
              store.dispatch(setDeletedResource({ status: "success", resource: formattedResource }));
              store.dispatch(setResources(resources.filter(item => item.name !== fromBytes32ToString(event?.returnValues?.name))));
              store.dispatch(setResourcesHashes(resourcesHashes.filter(item => item !== event?.returnValues?.name)));

              break;
            }
            case 'blacklist-user-added':
            {

              break;
            }
            case 'blacklist-user-removed':
            {

              return;
            }
            default: {
              requestResources();
            }
          }
        });
    }
  } catch (error) {
    console.error(`Due to error: ${error}, resource event listener has not been initialized.`);
  }
};

export const requestResourcesHashes = async () => {

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllResourcesInBytes32().call();
      store.dispatch(setResourcesHashes(response));
      return;
    }
  } catch (error) {
    console.log(error);
    useAlert("Something went wrong!", "red");
  }
  store.dispatch(setResourcesHashes([]));
};

export const requestResources = async () => {

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllResources().call();
      const formattedResources = formatResources(response);
      store.dispatch(setResources(formattedResources));
      return;
    }
  } catch (error) {
    console.log(error);
    useAlert("Something went wrong!", "red");
  }
  store.dispatch(setResources([]));
};

export const requestResource = async (resourceName: string) => {
  try {
    if (contract) {
      const resourceID = fromStringToBytes32(resourceName);
      const response = await contract?.methods.getResource(resourceID).call();
      const resourceResults = response?.name !== INVALID_BYTES_32 ? [formatResource(response)] : []
      store.dispatch(setResources(resourceResults));
      return;
    }
  } catch (error) {
    console.error(error);
    useAlert("Something went wrong!", "red");
  }
};

export const requestCreateResource = async (name: string, includeCurrentUser: boolean, userEbsiDID: string) => {
  const { connectedAccount, currentUserEbsiDID } = store.getState().accessControlList || {};
  const translatedName = fromStringToBytes32(name);
  const currentUser = includeCurrentUser ? currentUserEbsiDID : userEbsiDID;

  try {
    if (contract) {
      await contract?.methods.createResource(translatedName, currentUser).send({ from: connectedAccount });
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setCreatedResource({ status: "error", resource: { name, isCustom: true } }));
    debugger;
    const msg: string = deniedOp ? "Failed to create resource: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};

export const requestDeleteResource = async (name: string) => {
  const { resourcesHashes, connectedAccount } = store.getState().accessControlList || {};
  const translatedName: string = fromStringToBytes32(name);
  const newCreatedResourcesArray: string[] = resourcesHashes.filter((item: string) => item !== translatedName);

  try {
    if (contract) {
      await contract?.methods.deleteResource(translatedName, newCreatedResourcesArray).send({ from: connectedAccount });
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setDeletedResource({ status: "error", permission: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to delete resource: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};

export const triggerAddUserToBlacklist = (ebsiDID: string) => {
  // const { resourcesHashes, connectedAccount } = store.getState().accessControlList || {};
  // const translatedName: string = fromStringToBytes32(name);
  // const newCreatedResourcesArray: string[] = resourcesHashes.filter((item: string) => item !== translatedName);

  // try {
  //   if (contract) {
  //     await contract?.methods.addUserToBlackList(translatedName, newCreatedResourcesArray).send({ from: connectedAccount });
  //   }
  // } catch (error: any) {
  //   console.error(error);
  //   const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
  //   store.dispatch(setDeletedResource({ status: "error", permission: { name, isCustom: true } }));
  //   const msg: string = deniedOp ? "Failed to delete resource: User rejected transaction" : "Something went wrong";
  //   useAlert(msg, 'red');
  // }
};