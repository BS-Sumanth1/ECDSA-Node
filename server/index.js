const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp=require('ethereum-cryptography/secp256k1');
const {keccak256}=require('ethereum-cryptography/keccak');

app.use(cors());
app.use(express.json());
/* public - private
03f7ef781c581bc29121f74dfd9aa047e0d633749e4e839cb2588b972269478e0b - f45e7dfff6ffc1b2ed7641a1013491a9d9a1233c227313fdba5967a3b90cd168
029186e98567f298cd3e6a1b39751c750d07a9a4706d413641b4727f12db2c4860 - 3a9fcee298c94af2ec3151d0185e789cd1b57480722642b318163b9069f0f366
03db50c46e11bc6d97644f5c967fa2b5672d8e9d53d0ad23f964cbe3a177836247 - 6a85cf8e32e419c356d0e6a8814bea7e6b6dfcbaf40cc52a2b17449b18252a30
*/
const balances = {
  "03f7ef781c581bc29121f74dfd9aa047e0d633749e4e839cb2588b972269478e0b": 100,
  "029186e98567f298cd3e6a1b39751c750d07a9a4706d413641b4727f12db2c4860": 50,
  "03db50c46e11bc6d97644f5c967fa2b5672d8e9d53d0ad23f964cbe3a177836247": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, sign:signString, message } = req.body;
  const {recipient, amount } = message;

  const sign={
    ...signString,
    r: BigInt(signString.r),
    s: BigInt(signString.s)
  }

  const hash=(msg)=>keccak256(Uint8Array.from(msg));

  const isValid=secp.secp256k1.verify(sign,hash(message),sender)===true;

  if(!isValid){
    res.status(400).send({message:"Invalid Signature!"});
  }
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
