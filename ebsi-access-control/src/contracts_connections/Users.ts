import { store } from "../store/store";
import { setCreatedUser, setCurrentUserEbsiDID, setDeletedUser, setEbsiDIDs, setUpdatedUser, setUsers } from "../store/accessControlListStore";
import useAlert from "../hooks/useAlert";
import { contract } from "./ContractsConnections";
import { EBSI_DID_RESOLVED } from "../constants/Constants";
import { _arrayBufferToBase64, addNewLines, fromBytes32ToString, fromStringToBytes32, translateTimeFromSol } from "../utilities/utilities";
import { util } from "@cef-ebsi/key-did-resolver";
import ResourceRole from "../models/ResourceRole";
import User from "../models/User";

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

const transformResourceRoles = (resourceRoles: ResourceRole[]) => {
    return resourceRoles.map((resourceRole) => {
        const { role } = resourceRole || {};
        return {
            resourceName: fromStringToBytes32(resourceRole.resourceName),
            role: {
                name: fromStringToBytes32(role.name),
                isCustom: role.isCustom,
                permissions: role?.permissions?.map(permission => fromStringToBytes32(permission))
            }
        };
    });
};

const extractResourceNamesPayload = (resourceRoles: ResourceRole[]) =>
    resourceRoles?.map((resourceRole: ResourceRole) => fromStringToBytes32(resourceRole.resourceName)) || [];

export const convertPrivateToPEM = (privateKey: any) => {
    const b64 = addNewLines(_arrayBufferToBase64(privateKey));
    const pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";

    return pem;
};

const transformUser = (item: any): User => ({
    ebsiDID: item.ebsiDID,
    resources: item.resourcesHashes?.map((resourceName: any) => fromBytes32ToString(resourceName)),
    createdTime: translateTimeFromSol(item.createdTime).getTime(),
    lastAccess: translateTimeFromSol(item.lastAccess).getTime(),
    lastUpdate: translateTimeFromSol(item.lastUpdate).getTime()
});

const transformUsers = (response: any): User[] => {
    return response?.map((item: any) => transformUser(item));
};

export const listenForUsersEvents = () => {
    try {
        if (contract) {
            contract.events.UserUpdated()
                .on('data', (event: any) => {
                    const { users, ebsiDIDs } = store.getState().accessControlList || {};
                    switch (event?.returnValues?.eventType) {
                        case "creation": {
                            const userEbsiDID = event?.returnValues?.ebsiDID;
                            if (!users.some((user: User) => user.ebsiDID === userEbsiDID)) {
                                store.dispatch(setCreatedUser({ status: "success", ebsiDID: userEbsiDID }));
                                store.dispatch(setEbsiDIDs([...ebsiDIDs, userEbsiDID]));
                                requestUsers();
                            }

                            break;
                        }
                        case 'deletion': {
                            debugger;
                            const userEbsiDID = event?.returnValues?.ebsiDID;
                            store.dispatch(setDeletedUser({ status: "success", ebsiDID: userEbsiDID }));
                            store.dispatch(setUsers(users.filter(item => item.ebsiDID !== userEbsiDID)));
                            store.dispatch(setEbsiDIDs(ebsiDIDs.filter(item => item !== userEbsiDID)));

                            break;
                        }
                        case 'updated-resource-added':
                        case 'updated-resource-removed': 
                        {
                            debugger;
                            const userEbsiDID = event?.returnValues?.ebsiDID;
                            store.dispatch(setUpdatedUser({ status: "success", ebsiDID: userEbsiDID }));
                            requestUsers();

                            break;
                        }
                        case 'updated-resource-removed': {
                            debugger;
                            const userEbsiDID = event?.returnValues?.ebsiDID;
                            store.dispatch(setUpdatedUser({ status: "success", ebsiDID: userEbsiDID }));
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
    try {
        if (contract) {
            const response = await contract.methods.getAllEbsiDIDs().call();
            debugger;
            setEbsiDIDs(response);
        }
    } catch (error) {
        console.error(error);
        useAlert("Couldn't retrieve list of users", "red");
        setEbsiDIDs([]);
    }
};

export const requestUsers = async () => {
    try {
        if (contract) {
            const response = await contract?.methods.getAllUsers().call();
            const newUsers: User[] = transformUsers(response);
            store.dispatch(setUsers(newUsers));
            return;
        }
    } catch (error) {
        console.log(error);
        useAlert("Something went wrong!", "red");
    }
    store.dispatch(setUsers([]));
};

export const requestUser = async (ebsiDID: string) => {
    try {
        if (contract) {
            const response = await contract?.methods.getUser(ebsiDID).call();
            const newUsers: User[] = transformUsers(response);
            store.dispatch(setUsers(newUsers));
            return;
        }
    } catch (error) {
        console.error(error);
        useAlert("Something went wrong!", "red");
    }
};

export const requestEbsiDID = async () => {
    const connectedAccount = store.getState().accessControlList?.connectedAccount;
    const ebsiDIDCurrentUser = localStorage.getItem(EBSI_DID_RESOLVED);
    if (ebsiDIDCurrentUser) {
        store.dispatch(setCurrentUserEbsiDID(ebsiDIDCurrentUser));
        return;
    }

    try {
        if (contract && connectedAccount) {
            const response = await contract?.methods.getEbsiDID(connectedAccount).call({ from: connectedAccount });
            localStorage.setItem(EBSI_DID_RESOLVED, response);
            store.dispatch(setCurrentUserEbsiDID(response));
        }
    } catch (error) {
        console.error(error);
        store.dispatch(setCurrentUserEbsiDID(""));
    }
};

export const createUser = async (data: any) => {
    const connectedAccount = store.getState().accessControlList.connectedAccount;
    const { name, email, publicKey, resourceRoles } = data || {};
    let publicKeyJWK = publicKey;

    try {
        if (typeof (publicKey) === "string") {
            // const generateKeyOptions = {
            //     name: "ECDSA",
            //     namedCurve: "P-256"
            // };
            // const buffer = convertPEMToArrayBuffer(publicKey);
            // const importedPublicKey = await crypto.subtle.importKey('spki', buffer, generateKeyOptions, true, ['verify']);
            // const ECKey = window.ECKey;
            const publicKeyFromPEM = new window.ECKey(publicKey, 'pem');
            const jwk = JSON.stringify(publicKeyFromPEM, null, 2);
            publicKeyJWK = JSON.parse(jwk);
            // const importedPublicKey = await crypto.subtle.importKey('jwk', publicKeyFromPEM, generateKeyOptions, true, ['verify']);
            // publicKeyJWK = await crypto.subtle.exportKey("jwk", importedPublicKey);
        }
        const newEbsiDID = util.createDid(publicKeyJWK);
        const encodedResourceRoles = transformResourceRoles(resourceRoles);
        const resourceNames = extractResourceNamesPayload(resourceRoles);

        // Important: Here the method should depend on who is trying to create the resource
        // I'm assuming he/she's a natural person but it could be done for a legal entity too
        // Url to Legal Entity explanation: https://hub.ebsi.eu/tools/libraries/ebsi-did-resolver
        if (contract && newEbsiDID) {
            const response = await contract.methods.createUser(newEbsiDID, resourceNames).send({ from: connectedAccount });
            useAlert("User created", "green");
            await encodedResourceRoles.forEach(async (encodedResourceRole) => {
                await contract.methods.assignResourceToUser(newEbsiDID, encodedResourceRole.resourceName, encodedResourceRole.role).send({ from: connectedAccount })
            });

            return response;
        }
    } catch (error) {
        console.error(error);
        const deniedOp: boolean = JSON.stringify(error).indexOf('User denied transaction signature') > -1;
        store.dispatch(setCreatedUser({ status: "error", ebsiDID: '' }));
        debugger;
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
            const response = await contract.method.removeUser(ebsiDID, newUsersArray).send({ fromAccount: connectedAccount });
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