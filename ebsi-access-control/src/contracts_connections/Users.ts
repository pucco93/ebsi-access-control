import { store } from "../store/store";
import { setCreatedUser, setCurrentUserEbsiDID, setCurrentUserInView, setDeletedUser, setEbsiDIDs, setUpdatedUser, setUsers } from "../store/accessControlListStore";
import useAlert from "../hooks/useAlert";
import { contract } from "./ContractsConnections";
import { EBSI_DID_RESOLVED, mockRole } from "../constants/Constants";
import { _arrayBufferToBase64, addNewLines, fromBytes32ToString, fromStringToBytes32, translateTimeFromSol } from "../utilities/utilities";
import { util } from "@cef-ebsi/key-did-resolver";
import ResourceRole from "../models/ResourceRole";
import User from "../models/User";
import { formatRole } from "./Roles";


export const convertPrivateToPEM = (privateKey: any) => {
    const b64 = addNewLines(_arrayBufferToBase64(privateKey));
    const pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";

    return pem;
};

// UTILITY TO CREATE KEY PAIR FOR USER CREATION
export const createKeysPair = async () => {
    const generateKeyOptions = {
        name: "ECDSA",
        namedCurve: "P-521"
    };

    try {
        const { privateKey, publicKey } = await crypto.subtle.generateKey(generateKeyOptions, true, ['sign', 'verify']) || {};
        const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", privateKey);
        const exportedPublicKey = await crypto.subtle.exportKey("jwk", publicKey);

        return {
            privateKey: convertPrivateToPEM(exportedPrivateKey) || "",
            publicKey: exportedPublicKey
        };
    } catch (error) {
        console.error(error);
        return {
            privateKey: "",
            publicKey: {}
        };
    }
};

const removeDuplicatesAndEmptyData = (resourceRoles: ResourceRole[]) => [
    ...new Map(
        resourceRoles
            ?.filter(({ resourceName, role }) => resourceName && role?.name)
            ?.map((item) => [item?.resourceName, item])
    ).values(),
];

const formatResourceRole = (data: any): ResourceRole => ({
    resourceName: fromBytes32ToString(data?.resourceName) || '',
    role: formatRole(data?.role)
});

const formatResourceRoles = (data: any[]) => data?.map((item: any) => formatResourceRole(item));

const transformResourceRole = (resourceRole: ResourceRole) => {
    const { role, resourceName } = resourceRole || {};

    return {
        resourceName: fromStringToBytes32(resourceName),
        role: {
            name: fromStringToBytes32(role.name),
            isCustom: role.isCustom,
            permissions: role?.permissions?.map(permission => fromStringToBytes32(permission))
        }
    };
};

const findDeletedResources = (resources: string[], newResources: string[]) =>
    resources
        .filter(resource => newResources.every(newResource => newResource !== fromStringToBytes32(resource)))
        ?.map((resource: string) => fromStringToBytes32(resource));

const extractResourceNamesPayload = (resourceRoles: ResourceRole[]) =>
    Array.from(new Set(resourceRoles?.map((resourceRole: ResourceRole) => fromStringToBytes32(resourceRole.resourceName)))) || [];

// const addNewResourcesOnly = (resources: string[], encodedResourceRoles: any[]) => {
//     resources = resources.map(resource => fromStringToBytes32(resource));
//     encodedResourceRoles.forEach((encodedResourceRole => {
//         if (resources.indexOf(encodedResourceRole.resourceName) < 0) {
//             resources.push(encodedResourceRole.resourceName);
//         }
//     }));

//     return resources;
// };


const transformUser = (item: any): User => ({
    ebsiDID: item.ebsiDID,
    resources: item.resourcesHashes?.map((resourceName: any) => fromBytes32ToString(resourceName)),
    createdTime: translateTimeFromSol(item.createdTime).getTime(),
    lastAccess: translateTimeFromSol(item.lastAccess).getTime(),
    lastUpdate: translateTimeFromSol(item.lastUpdate).getTime()
});

const transformUsers = (response: any): User[] => response?.map((item: any) => transformUser(item));

export const listenForUsersEvents = () => {
    try {
        if (contract) {
            contract.events.UserUpdated()
                .on('data', (event: any) => {
                    const {
                        users,
                        ebsiDIDs,
                        createdUser,
                        deletedUser,
                        updatedUser
                    } = store.getState().accessControlList || {};

                    switch (event?.returnValues?.eventType) {
                        case "creation": {
                            const userEbsiDID = event?.returnValues?.ebsiDID;
                            if (!createdUser?.ebsiDID) {
                                if (!users.some((user: User) => user.ebsiDID === userEbsiDID)) {
                                    store.dispatch(setCreatedUser({ status: "success", ebsiDID: userEbsiDID }));
                                    store.dispatch(setEbsiDIDs([...ebsiDIDs, userEbsiDID]));
                                }
                            }
                            requestUsers();

                            break;
                        }
                        case 'deletion': {
                            if (!deletedUser?.ebsiDID) {
                                const userEbsiDID = event?.returnValues?.ebsiDID;
                                store.dispatch(setDeletedUser({ status: "success", ebsiDID: userEbsiDID }));
                                store.dispatch(setUsers(users.filter(item => item.ebsiDID !== userEbsiDID)));
                                store.dispatch(setEbsiDIDs(ebsiDIDs.filter(item => item !== userEbsiDID)));
                            }
                            requestUsers();

                            break;
                        }
                        case 'updated-resource-added':
                        case 'updated-resource-removed':
                            {
                                if (!updatedUser?.ebsiDID) {
                                    const userEbsiDID = event?.returnValues?.ebsiDID;
                                    store.dispatch(setUpdatedUser({ status: "success", ebsiDID: userEbsiDID }));
                                }
                                requestUsers();

                                break;
                            }
                        default: {
                            requestUsers();
                        }
                    }
                });
        }
    } catch (error) {
        console.error(`Due to error: ${error}, resource event listener has not been initialized.`);
    }
};

export const requestUsersEbsiDIDsArray = async () => {
    const { connectedAccount } = store.getState().accessControlList || {};
    
    try {
        if (contract) {
            const response = await contract.methods.getAllEbsiDIDs().call({ from: connectedAccount });
            store.dispatch(setEbsiDIDs(response));
        }
    } catch (error) {
        console.error(error);
        useAlert("Couldn't retrieve list of users", "red");
        store.dispatch(setEbsiDIDs([]));
    }
};

export const requestUsers = async () => {
    const { connectedAccount } = store.getState().accessControlList || {};

    try {
        if (contract) {
            const response = await contract?.methods.getAllUsers().call({ from: connectedAccount });
            const newUsers: User[] = transformUsers(response);
            store.dispatch(setUsers(newUsers));
        }
    } catch (error) {
        console.log(error);
        useAlert("Something went wrong!", "red");
        store.dispatch(setUsers([]));
    }
};

export const requestUser = async (ebsiDID: string) => {
    const { connectedAccount } = store.getState().accessControlList || {};

    try {
        if (contract) {
            const response = await contract?.methods.getUser(`did:key:${ebsiDID}`).call({ from: connectedAccount });
            if (response?.ebsiDID) {
                const newUsers: User[] = transformUsers(response);
                store.dispatch(setUsers(newUsers));
            }
            useAlert("No user found for that ebsiDID");
        }
    } catch (error) {
        console.error(error);
        useAlert("Something went wrong!", "red");
    }
};

export const requestEbsiDID = async () => {
    const { connectedAccount } = store.getState().accessControlList || {};
    const ebsiDIDCurrentUser = localStorage.getItem(EBSI_DID_RESOLVED);
    if (ebsiDIDCurrentUser) {
        store.dispatch(setCurrentUserEbsiDID(ebsiDIDCurrentUser));
        return ebsiDIDCurrentUser;
    }

    try {
        if (contract && connectedAccount) {
            const response = await contract?.methods.getEbsiDID(connectedAccount).call({ from: connectedAccount });
            localStorage.setItem(EBSI_DID_RESOLVED, response);
            store.dispatch(setCurrentUserEbsiDID(response));
            return response;
        }
    } catch (error) {
        console.error(error);
        store.dispatch(setCurrentUserEbsiDID(""));
        return "";
    }
};

export const createUser = async (data: any) => {
    const { connectedAccount } = store.getState().accessControlList || {};
    const { name, email, publicKey, resourceRoles } = data || {};
    let publicKeyJWK = publicKey;

    try {
        const requester = await requestEbsiDID();

        if (typeof (publicKey) === "string") {
            const publicKeyFromPEM = new window.ECKey(publicKey, 'pem');
            const jwk = JSON.stringify(publicKeyFromPEM, null, 2);
            publicKeyJWK = JSON.parse(jwk);
        }
        const newEbsiDID = util.createDid(publicKeyJWK);
        const encodedResourceRoles = resourceRoles?.map((resourceRole: ResourceRole) => transformResourceRole(resourceRole));
        const resourceNames: string[] = extractResourceNamesPayload(resourceRoles);

        // Important: Here the method should depend on who is trying to create the resource
        // I'm assuming he/she's a natural person but it could be done for a legal entity too
        // Url to Legal Entity explanation: https://hub.ebsi.eu/tools/libraries/ebsi-did-resolver
        if (contract && newEbsiDID) {
            const response = await contract.methods.createUser(newEbsiDID).send({ from: connectedAccount });
            useAlert("User created", "green");
            if (requester && resourceNames?.length > 0) {
                await encodedResourceRoles.forEach(async ({ resourceName, role }: any) => {
                    await contract.methods.updateUserResources(requester, newEbsiDID, resourceNames, resourceName, role, "creation").send({ from: connectedAccount })
                });
            } else if (!requester && resourceNames?.length > 0) {
                useAlert('Current user cannot create resources, register it before using app!', 'red');
            }

            return response;
        }
    } catch (error) {
        console.error(error);
        const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
        store.dispatch(setCreatedUser({ status: "error", ebsiDID: '' }));
        const msg: string = deniedOp ? "Failed to create user: User rejected transaction" : "Something went wrong";
        useAlert(msg, "red");
        return {};
    }
};

export const requestDeleteUser = async (user: User) => {
    const { connectedAccount, ebsiDIDs } = store.getState().accessControlList || {};
    const { ebsiDID } = user;
    const newUsersArray = ebsiDIDs.filter(item => item !== ebsiDID);

    try {
        if (contract) {
            const response = await contract.methods.removeUser(ebsiDID, newUsersArray).send({ from: connectedAccount });
            if (response) {
                useAlert(`User: ${ebsiDID} correctly deleted!`, "green");
            }
        }
    } catch (error) {
        console.error(error);
        const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
        store.dispatch(setDeletedUser({ status: "error", ebsiDID }));
        const msg: string = deniedOp ? "Failed to delete user: User rejected transaction" : "Something went wrong";
        useAlert(msg, "red");
        return;
    }
};

export const updateUser = async (user: User | null, resourceRoles: ResourceRole[] = []) => {
    const { connectedAccount } = store.getState().accessControlList || {};
    const { ebsiDID, resources = [] } = user || {};
    const preparedResourceRolesPayload = removeDuplicatesAndEmptyData(resourceRoles);
    const encodedResourceRoles = preparedResourceRolesPayload?.map(
        (resourceRolePayload: ResourceRole) => transformResourceRole(resourceRolePayload));
    const newResources = encodedResourceRoles?.map((encodedResourceRole: any) => encodedResourceRole.resourceName);
    const deletedResources = findDeletedResources(resources, newResources);

    try {
        const requester = await requestEbsiDID();

        // All the new resources must pass to updateUser
        if (contract && user && requester) {
            if (preparedResourceRolesPayload?.length > 0) {
                await encodedResourceRoles.forEach(async ({ resourceName, role }) => {
                    await contract.methods.updateUserResources(
                        requester,
                        ebsiDID,
                        newResources,
                        resourceName,
                        role,
                        'creation'
                    ).send({ from: connectedAccount });
                });
            }

            if (deletedResources?.length > 0) {
                // Here this will remove every selected resource from the new resource array, this is better than filtering for each one before launching the call to solidity, it avoids any problems related to asynchronous calls

                await deletedResources.forEach(async (resource: string) => {
                    await contract.methods?.updateUserResources(
                        requester,
                        ebsiDID,
                        newResources,
                        resource,
                        mockRole,
                        'deletion'
                    ).send({ from: connectedAccount });
                });
            }
        } else {
            useAlert('Current user cannot create resources, register it before using app!', 'red');
        }
    } catch (error) {
        console.error(error);
        const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
        store.dispatch(setUpdatedUser({ status: "error", ebsiDID }));
        const msg: string = deniedOp ? "Failed to update user: User rejected transaction" : "Something went wrong";
        useAlert(msg, "red");
        return;
    }
};

export const getAllUserRoles = async (ebsiDID: string) => {
    const { connectedAccount } = store.getState().accessControlList || {};

    try {
        if (contract) {
            const response = await contract?.methods.getAllUserRoles(ebsiDID).call({ from: connectedAccount });
            const formattedRoles = formatResourceRoles(response);
            store.dispatch(setCurrentUserInView({ user: ebsiDID, resourceRoles: formattedRoles }));
            return;
        }
    } catch (error) {
        console.error(error);
        return;
    }
};
