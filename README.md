# EBSI Access Control List

## Introduction <a name="introduction"></a>

This project is done for course called Distributed Systems at the University of Urbino Carlo Bo, applied informatics faculty (Master's degree).

It aims to demonstrate the potential of Web3, in this case it borrows a new European Decentralized method, to indentify legal entities and natural persons, to use these new **Decentralized Identities** (**DIDs**) in an **Access Control List** (**ACL**).
**EBSI** (**European Blockchain Services Infrastructure**) is a new infrastructure built by European Commission with the goal to create cross-border services, create trustworthy services and verify information.

The project's scope is to define a new way to share resources between users which are identified by their unique EBSI DID keeping centered the access policies defined by the resources.
This is done by the ACL in the created smart contracts which define methods and tools to store and manipulate data, trying to merge authentication and authorization with the core values of blockchain systems.
In the next sections it will be explained how this can be achieved using Solidity programming language, Ethereum blockchain and some tools from European Commission.

Here are available more information about [EBSI](https://ec.europa.eu/digital-building-blocks/sites/display/EBSI) concept and future developments.

## EBSI DIDs

This section aims to explain better what is an EBSI DID why the European Union want to use them and how these are created.

To answer to the first question the EBSI DID as said above have been developed to identify users in a new manner with the scope to be cross-border. Currently every country in EU has their digital ID which is centrified, in practical:

- The user has to request to an identity provider to receive his digital identity, this is played in some countries by a government office while in others is delegated to official issuers (Italy is in the second countries list).
- Once the user has given all his personal data and contact the issuer to confirm his identity (it can be a visit at his closest postal office or by a video-call), the issuer provide a digital identity to the requester.
- The user has now a digital identity which can be used online on the government's services.

At first sight this can be a good procedure, where a certified identity provider who is constantly in contact with the government has all the power on identifiy the user and give him access to the services, but in reality this can be unconvenient due to the cross-border problem.
This problem raise when the EU citizen wants to move to another country in EU, here the previous identity provider could be totally unofficial or the new country governament does not have access to the issuer database.
So the user has no other options than going through the entire process another time by giving again all his personal data.

EBSI DIDs which relies on the concept of Decentralized Identities (from the page [DID Core](https://www.w3.org/TR/did-core/)) are a type of decentralized identifiers made by EU which should avoid entirely the problem by letting the community together with international issuers verify the data.
The user who wants to be authenticated by his DID must use his public key to create his DID and enter the EBSI blockchain to be always verifiable.
When the user send requests for official services (tax payments, new ID card, passport, etc) can send a request using his EBSI DID, on the other hand the office that receive the request can resolve the DID received with the request and see if the person asking is really who's claiming to be.
This can remove entirely some problems with the personal data requests like asking to be adult without inserting his personal birth date.

This leads to why the EU wants to adopt this new system, in fact this should lead to more security for the users who can decide better which information they want to disclouse with the services.
In future these could be used for many more usages, like notarial deeds.
Some of the successful pilots:

- using the DIDs to identify students who wanted to apply for a PhD in a foreign country but with a master/bachelor degree received in their homecountry.
- Graduated citizens applying for jobs in foreign countries requiring ot have a degree (which the citizens have in their home country).
- More can be found here: [success stories](https://ec.europa.eu/digital-building-blocks/sites/display/EBSI/Verifiable+Credentials+Success+Stories)

Lastly how is an EBSI DID created?
To create an EBSI DID the user must start by generating his DID and DID keys, which can be done using his public key, then the user can ask to request a DID Document where there will be more information regarding how to verify his identity with its `verifiableMethods`.

## Technical side <a name="technical_side"></a>

The first approach was to use the already existing EBSI blockchain to use EBSI DIDs by default instead of relying on the Ethereum (ETH) addresses.
However the European Commission does not grant the use of the blockchain to all the interested developers, because this is a permissioned blockchain, which means developers can test their dApps only after submitting it and then receiving a positive response from EU responsible committee.

So the project has to rely on ETH blockchain and use the ETH addresses as a point to connect the dApp to the smart contracts which are instead using only EBSI DIDs for identifying users.

On the technical side it should be noted the tool used for the project:

- On the smart contracts side:
  - `Solidity` programming language to develop the smart contracts which define the data manipulation and how to store data side.
  - To create the keys pair it has been used `openssl` so that the user can use the same algorythm as Ethereum has.
        In a chapter below it will be explain exactly how to create the keys on the machine locally.
  - `Truffle suite` is a suite comprehending all the necessary tools to build, deploy and migrate smart contracts, this can also be used without Ganache and its UI, by simply create a virtual Testnet by command line.
  - `Ganache v7` is the tool used to create a virtual node and 10 accounts, these are used to deploy the smart contract and they cna also be used to interact with the smart contract.
  - `Metamast` is used to import the web3 accounts used to simulate the network, it also has many useful functions to retrieve data about the logged users.
- On the client side:
  - `React` and `Vite` (with `TypeScript`) have been used to create the different views and manage the packages needed to show the data.
  - To connect the client-side with the smart contracts and Ethereum it has been used `Web3.js` which is a Javascript library that can be installed using Node (an alternative is `Ether.js`)
  - `@cef-ebsi/key-did-resolver` is a npm package which is open source and maintened by European Commission, it is used to create DIDs and to solve them and retrieve DID document. This can be used on natural persons or on legal entities. The two methods differ for the final result.
  - `crypto` is a set pf functions used to create and handle keys, in the project it is used to create the key pair in elliptic curve secp256k1 as made in Ethereum, these will be used to create the user DID and the user account.
  - `ec-key` is a npm package used to handle elliptic curve cryptographic keys, in the project it's used to import the public key the user enters in an input field. It is a Node Backend-only package which has been browserified to be used on client side.

Some minor but relevant packages used in the project are:

- MaterialUI
- luxon
- browserify

One important note on this project is that it's always using the ECDSA algorythm to generate keys pair.

For the most part of the development the most used tool was Remix - Ethereum IDE, which can be found at this url [remix.ethereum.org](remix.ethereum.org).
This has some important feature that the other IDEs don't have, like the compiler, the deploy and run transactions and debugger.
These three tools were game changer for these reasons:

- Compiler: this was really useful because it could find problems easier and find the cost to be deployed.
- Deploy: it was useful because the developer can instantly build and deploy a small change.
- Run transactions and debugger: these two tools can make developer job a lot easier because he can pass arguments to run a function available in the deployed smart contract and check every details:
  - Gas cost
  - Input params
  - Output params

And then this could be debugged through breakpoints or step by step seeing what the function is doing and how it is changing the current state.

## Deploy

To deploy the solidity part into a testnet it has been created a truffle-config.json which contains all the rules and informations to deploy correctly.
The file is required when launching the command: `truffle migrate --network development`, which will trigger truffle to create the build files using the development data.
One important part in this file is:

```
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: 5777,      // Any network (default: none)
      gas: 30000000,
    },
  }
```

This inform the command line to create a newtowrk on `127.0.0.1` (localhost) on port: `7545` and identify the network iwht id `5777`, with a maximum gas cost of `30000000`.
This last number is particularly important for developers because it highlights the maximum cost to deploy the smart contracts, this cost is real money the developer has to spend.
A little below there's another important part:
```
  compilers: {
    solc: {
      version: "0.8.17",   // Fetch exact version from solc-bin (default: truffle's version)(default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 1000
        },
        evmVersion: "london"
      }
    }
  }
```

This is instructing truffle to use solidity version 0.8.17, to run with an optimizer and use ethereum virtual machine version london on verification process.
Last important file is 1_initial_migrations.js which requires the name of the contract to be deployed, in this case **AccessControlList**.
```
const AccessControlList = artifacts.require('AccessControlList');

module.exports = async (deployer) => {
  await deployer.deploy(AccessControlList);
};
```

## Run the project <a name="run_the_project"></a>

Prerequisites:

- Metamask extension on the browser
- Ganache v2.7.1 (at least - or equivalent with London fork available)
- openssl commands line
- node > v16.xx.xx
- truffle suite

The following steps will help creating the right environment to run the project.

- Firstly the user has to clone the repo from github.
- Open a terminal and install all the dependencies by running `npm install` in the root folder (where package.json is located).
- Run the client side application with `npm run dev` (from the location package.json is).
At this point the application should run on the browser in localhost and it should be configured to get data from smart contract, but first the user should create the testnet.

- Open Ganache and create a new workspace linking the workspace with the truffle project (search for the folder where the truffle-config.json is).
- Choose at least london fork or newer to create the workspace because this is required to run without issues on some functions.
- The port number should be: `7545` while the network ID should be `5777`, this will let the deploy and migration commands link the project between frontend and solidity part.
- Create the ganache testnet.
- Build and deploy the smart contracts using command: `truffle migrate --network development` on a terminal from inside the repo, where the `truffle-config.json` is.
  - If there are any problems during this last operation it could be related to the gas limit which is caused by the dimensions of the smart contract, to fix it consider to adjust gas limit by increasing it accordingly (this is normally defined by the command on the error logs).

Now the smart contract should be deployed in the ganache testnet and the dApp running in background using node should be visible in the browser.
To start using the dApp the user have to create a new user using his public key or leaving the generation to the dApp.

In the first cae the user have to:

1. Create a new private key running following command using openssl:

    ```openssl ecparam -name secp256k1 -genkey -noout -out ec-secp256k1-priv-key.pem```

    this will generate a new file in the project root with private key in PEM format inside (this is human readable with some formatted data).
2. Now the user can create his public key by running:

    ```openssl ec -in ec-secp256k1-priv-key.pem -pubout > ec-secp256k1-pub-key.pem```

    the user should have both the private key and public key in PEM format available in the project root folder.

3. The user should now run the following command to generate a text containing the private key and the public key in exadecimal:

    ```openssl ec -text -noout -in ec-key.pem```
4. The terminal should show a text like this example:

```
read EC key
Private-Key: (256 bit)
priv:
    ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:
    ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:
    ff:ff
```

From here the user should remove every colon occurence from the priv string and in case the first exadecimal element is composed by 00 remove them from the string.
The string should now the of length 32 bytes, while the public key (which is not shown here) should be 64 bytes long.

5. Append `0x` to the string as a prefix and use it to import a new account in Metamask.

6. To create a user with the dApp, login to the dApp by using the button on top-right and see the Ethereum address being displayed in that section.

7. Open the users view by clicking no the left menu item called 'Users' and then on 'Create users'

    7.1. The user have to click on the toggle to insert his own public key in PEM format pasting it into the textarea.

    7.2. Click on create button to create the user, a small green alert should be visible in the lower part of the screen

To have the same result but leaving the key pair generation to the dApp the use ehas to follow these steps:

1. Open the Users view by clicking on Users menu item on the left.
2. Click on Create user button on the right
3. Now the user should see a dialog asking for some info, but the important one is the button to create a keys pair. Clicking this will generate a keys pair with the private key being displayed in the below text area.
4. Important: the user must copy and paste this private key in a safe area where only the user can access and recover the key whenever he needs to. This will be the last time he can see it.
5. Before proceding it is necessary to paste the private key in PEM format into a file and follow points 2, 3, 4, 5 and 6 from previous list (replacing the filename in point 2 with the given filename) to generate the new account and import it into Metamask so that the new user being created during the process has the right Ethereum address as backup.
6. In the meanwhile the dApp has created and store locally the public key to generate the EBSI DID to send it to Solidity smart contract. Clicking on the Create button on the lower part of the dialog should create the user leaving a small green alert in the page.

Now the user should have his own account and is free to play with the project, creating new custom roles or permissions and creating resource to be assigned or to blacklist other users from accessing the resources where he is admin.
NOTE: for some parts of this process (creating a user) requires some ETH because the smart contract is going to write on blockchain so to reward the chain it needs some gas. If the user doesn't have enough ETH on his address it won't create the user reverting every change and alerting the user.

## Solidity code choices

In some solidity functions the project has been refactored to optimize the code, at first try the code was looping too much to delete or to write in variables and this was increasing too much the gas consumption causing most of the time a revert or an internal error meaning the code is an anti-pattern.
In example removeUser was called removeUsers and was meant to delete an array of users looping through the passed array from client-side, but this has been changed to a function which changes only a user per time, this has downsides like running the same multiple time to emulate the deletion fo multiple users in one time, this also creates more request to Metamask that needs to accept multiple times to complete the actions.

Some other functions were looping through the created items array before the refactor has been optimized with the check into a mapping, differently from a for loop, this has less gas consumption in runtime and does not require to go through the entire array length.

Functions like `updateResourceBlackList` and `updateUserResources` were before divided into a function adding items, one removing items and another one to edit the resource or user, these were adding gas consumption during deploy and not adding any relevant improvement, so those have been refactored into a single function which based on a param choose what to do.

In general Solidity forces the developer to optimize the code to spend the least amount of gas to deploy and run the transactions, but this means learning new mechanics to not reach the max with anti-patterns that in some other languages may be normal patterns even thougth they could be not efficient but trascurable.

For more info regarding functions and what they do there is an interface file with all the virtual functions which can be found [here](https://github.com/pucco93/ebsi-access-control/blob/main/ebsi-access-control/contracts/IAccessControlList.sol).

## Main features

The project adpots a role-based model where a user has a single role per each resource. 
A role is made of a name, a list of permissions and a true/false value that indicates if the role is custom or not.
The user can create custom roles and assign them to other users in the resources he creates. A role can have more than one single permission and these are used in many solidity functions that check if the user doing the action has enough permission to do it.
Furthermore resources have the possibility to add/remove users to/from a blacklist, this action has the goal to limit which user can access a resource.

The dApp is made of 4 views: Users, Resources, Roles and Permissions. Every view is composed by a search bar and a create button on top and a table on the lower part.
The table display the data from every item in list, and has actions on the right side to remove or edit the row. Each item has different editing options based on item type.

- Users view has the button to create new users, this opens a dialog with required data and options to create the user.
The table displays the ebsi did, a list of resources some data regarding creation date and last access/update.
In the users table the actions can remove a user or open a dialog to edit it, this last dialog gives the ability to add or remove resources from a user and change resources and roles to him.

- Resources view has a button to create a resource which requires only a name, the table displaying the name the users in blacklist and the actions. The actions available are delete and edit. Editing a resource means adding or removing users from its blacklist.

- Roles view shows the table with all the created roles, with each rows rendering the role name, a checkmark or cross icon to let the user know if it is custom or not and actions to delete the role. This action is only available if the role is custom.

- Permissions view shows a table containing created permissions, a button to create new custom permissions. The available action is only the delete permission which is available only if the permission is custom.

## Known issues <a name="known_issues"></a>

One of the most important issue found during the development involves the users creation, it must be noted that creating a new user has to be done using a different metamask profile every time, so this operation cannot be done to create a user for someone else. This would associate the new EBSI DID to the same ETH address.
Sadly this problem raise because the project had to rely on ETH blockchain and then simulate the EBSI platform.

## Possible future implementations <a name="future_implementations"></a>

After having worked many hours with this tech stack some things which would be definitely replaced are Web3.js and Truffle with Ether.js and Hardhat. This changes are meant to increase the possbilities that these tools have in comparison to what Truffle and Web3.js can do now. On a developer side they seems to be easier to adopt and to maintain.

The possibility to create custom role and custom permissions imply that in future could be possible to create functions which require a certain permission to be done.

## Useful links <a name="useful_links"></a>

- [EBSI link](https://ec.europa.eu/digital-building-blocks/sites/display/EBSI/Home)
- [Openssl](https://www.openssl.org/)
- [EC-Key](https://github.com/usrz/ec-key)
- [Web3.js](https://web3js.readthedocs.io/en/v1.10.0/)
- [MetaMask](https://metamask.io/)
- [Truffle suite](https://trufflesuite.com/)
- [Ganache](https://trufflesuite.com/ganache/)
