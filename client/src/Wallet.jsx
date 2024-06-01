import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import { toHex } from 'ethereum-cryptography/utils';

function Wallet({ address, setAddress, privateKey, setPrivateKey, balance, setBalance }) {
  async function onChange(evt) {
    const privateKeyInput = evt.target.value;
    setPrivateKey(privateKeyInput);

    try {
      const privateKeyBigInt = BigInt('0x' + privateKeyInput);
      
      const publicKey = secp.secp256k1.getPublicKey(privateKeyBigInt);
      
      const publicKeyHex = toHex(publicKey);

      setAddress(publicKeyHex);

      if (publicKeyHex) {
        const {
          data: { balance },
        } = await server.get(`balance/${publicKeyHex}`);
        setBalance(balance);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error("Error:", error);
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type Private Key" value={privateKey} onChange={onChange}></input>
      </label>
      <div>
        Address : {address.slice(0,8)+'...'}
      </div>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
