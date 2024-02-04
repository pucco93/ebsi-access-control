import { INVALID_BYTES_32 } from "../constants/Constants";
import useAlert from "../hooks/useAlert";
import { setBlacklistUsers, setCreatedResource, setDeletedResource, setResources, setResourcesHashes, setUpdatedResource } from "../store/accessControlListStore";
import { store } from "../store/store";
import { fromBytes32ToString, fromStringToBytes32 } from "../utilities/utilities";
import { contract } from "./ContractsConnections";
import { requestEbsiDID } from "./Users";

export const formatResource = ({ name, blacklist }: any): Resource => ({
  name: fromBytes32ToString(name),
  blacklist: blacklist?.map((blacklistedUser: string) => blacklistedUser) || []
});

export const formatResources = (response: any[]): Resource[] =>
  response.map(item => formatResource(item));

export const formatResourceEvent = (response: any): Resource => ({
  name: fromBytes32ToString(response?.name),
  blacklist: []
});

export const removeUselessData = (response: any[]) => response.filter((item: any) => item.name !== INVALID_BYTES_32);

export const listenForResources = () => {
  try {
    if (contract) {
      contract.events.ResourceUpdated()
        .on('data', (event: any) => {
          const { resources, resourcesHashes } = store.getState().accessControlList || {};
          switch (event?.returnValues?.eventType) {
            case "creation": {
              const formattedResource = formatResourceEvent(event?.returnValues);
              if (!resources.some((resource: Resource) => resource.name === formattedResource.name)) {
                store.dispatch(setCreatedResource({ status: "success", resource: formattedResource }));
                store.dispatch(setResources([...resources, formattedResource]));
                store.dispatch(setResourcesHashes([...resourcesHashes, event?.returnValues?.name]));
              }

              requestResources();

              break;
            }
            case 'deletion': {
              const formattedResource = formatResourceEvent(event?.returnValues);
              store.dispatch(setDeletedResource({ status: "success", resource: formattedResource }));
              store.dispatch(setResources(resources.filter(item => item.name !== fromBytes32ToString(event?.returnValues?.name))));
              store.dispatch(setResourcesHashes(resourcesHashes.filter(item => item !== event?.returnValues?.name)));

              requestResources();

              break;
            }
            case 'blacklist-updated':
              {
                const formattedResource = formatResourceEvent(event?.returnValues);
                store.dispatch(setUpdatedResource({ status: 'success', resource: formattedResource }));

                requestResources();

                break;
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
  const { connectedAccount } = store.getState().accessControlList || {};

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllResourcesInBytes32().call({ from: connectedAccount });
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
  const { connectedAccount } = store.getState().accessControlList || {};

  try {
    if (contract) {
      const response: any = await contract?.methods.getAllResources().call({ from: connectedAccount });
      const unformattedFilteredData = removeUselessData(response); 
      const formattedResources = formatResources(unformattedFilteredData);
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
  const { connectedAccount } = store.getState().accessControlList || {};

  try {
    if (contract) {
      const resourceID = fromStringToBytes32(resourceName);
      const response = await contract?.methods.getResource(resourceID).call({ from: connectedAccount });
      const resourceResults = response?.name !== INVALID_BYTES_32 ? [formatResource(response)] : []
      store.dispatch(setResources(resourceResults));
      return;
    }
  } catch (error) {
    console.error(error);
    useAlert("Something went wrong!", "red");
  }
};

export const requestCreateResource = async (name: string) => {
  const { connectedAccount } = store.getState().accessControlList || {};
  const translatedName = fromStringToBytes32(name);

  try {
    const requester = await requestEbsiDID();
    if (contract && requester) {
      await contract?.methods.createResource(requester, translatedName).send({ from: connectedAccount });
    } else {
      useAlert('Current user cannot create resources, register it before using app!', 'red');
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setCreatedResource({ status: "error", resource: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to create resource: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};

export const requestDeleteResource = async (name: string) => {
  const { resourcesHashes, connectedAccount } = store.getState().accessControlList || {};
  const translatedName: string = fromStringToBytes32(name);
  const newCreatedResourcesArray: string[] = resourcesHashes.filter((item: string) => item !== translatedName);

  try {
    const requester = await requestEbsiDID();

    if (contract && requester) {
      await contract?.methods.deleteResource(requester, translatedName, newCreatedResourcesArray).send({ from: connectedAccount });
    } else {
      useAlert('Current user cannot create resources, register it before using app!', 'red');
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setDeletedResource({ status: "error", permission: { name, isCustom: true } }));
    const msg: string = deniedOp ? "Failed to delete resource: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};

// export const requestBlacklist = async (name: string) => {
//   const connectedAccount = store.getState().accessControlList.connectedAccount;
//   const encodedName = fromStringToBytes32(name);
//   const requester = await requestEbsiDID();

//   try {
//     if (contract && requester) {
//       const response = await contract.methods.getAllUsersInBlacklist(requester, encodedName).call({ from: connectedAccount });
//       store.dispatch(setBlacklistUsers([]));
//     }
//   } catch (error) {
//     console.log(error);
//     useAlert("Something went wrong!", "red");
//   }
// };

export const requestUpdateBlacklist = async (resource: string, newBlacklist: string[]) => {
  const { connectedAccount } = store.getState().accessControlList || {};
  const encodedResource = fromStringToBytes32(resource);

  try {
    const requester: string = await requestEbsiDID() || "";

    if (contract) {
      await contract?.methods.updateResourceBlackList(requester, encodedResource, newBlacklist).send({ from: connectedAccount });
      return;
    }
  } catch (error: any) {
    console.error(error);
    const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
    store.dispatch(setUpdatedResource({ status: "error", resource: '' }));
    const msg: string = deniedOp ? "Failed to update blacklist: User rejected transaction" : "Something went wrong";
    useAlert(msg, 'red');
  }
};