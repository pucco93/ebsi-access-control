// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;

import './IAccessControlList.sol';

/**
 * @title Utilities
 */
abstract contract Utilities is IAccessControlList {

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    function createStringHash(string calldata toHashString) internal pure returns (string memory) {
        return bytes32ToString(keccak256(abi.encodePacked(toHashString)));
    }

    function createStringHashFrom2Args(string calldata ebsiDID, bytes32 resourceName) internal pure returns (string memory) {
        return bytes32ToString(keccak256(abi.encodePacked(ebsiDID, resourceName)));
    }

    function createResourceToRoleHash(string calldata ebsiDID, bytes32 resourceUID) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(resourceUID, ebsiDID));
    }

    function compareStrings(string memory string1, string memory string2) internal pure returns (bool) {
        return keccak256(abi.encodePacked(string1)) == keccak256(abi.encodePacked(string2));
    }

    function getEbsiDID(address _address) external view returns (string memory) {
        return addressesToEbsiDID[_address];
    }
}