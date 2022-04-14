// Deployed using Remix


pragma solidity >=0.7.0 <0.9.0;

contract MetaTx {
    event Hash(bytes32 contract_encoding, bytes32 relayer_encoding);
    event Executed(address relayer, address user);

    function execute(address to, uint value, bytes32 txHash, uint8 v, bytes32 r, bytes32 s) public returns(address){
        bytes memory encoded = abi.encode(to, value);
        bytes32 temp = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", toString(encoded.length), encoded));
        emit Hash(temp, txHash);

        address a = ecrecover(txHash, v, r, s);
        emit Executed(msg.sender, a);
    }

    function handleExecute(address target, address relative, uint amount, uint price, bytes32 txHash, uint8 v, bytes32 r, bytes32 s) public returns(address){
        bytes memory encoded = abi.encode(target, relative, amount, price);
        bytes32 temp = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", toString(encoded.length), encoded));
        emit Hash(temp, txHash);

        address a = ecrecover(txHash, v, r, s);
        emit Executed(msg.sender, a);
    }
    
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}