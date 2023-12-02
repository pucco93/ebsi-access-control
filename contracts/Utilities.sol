// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './IACList.sol';

/**
 * @title Utilities
 */
abstract contract Utilities is IACList {

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

    function createHash(bytes32 toHash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(toHash));
    }

    function createResourceToRoleHash(bytes32 resourceUID, bytes32 ebsiDID) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(resourceUID, ebsiDID));
    }

    function compareStrings(string memory string1, string memory string2) internal pure returns (bool) {
        return keccak256(abi.encodePacked(string1)) == keccak256(abi.encodePacked(string2));
    }
}