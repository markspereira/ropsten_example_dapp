import React, { Component } from 'react';
import logo from './52.png';
import './App.css';

import http from 'http';
import net from 'net';
import Web3 from 'web3';
import Tx from 'ethereumjs-tx';

//import secp from 'secp256k1';


const web3 = new Web3('https://ropsten.infura.io/rqmgop6P5BDFqz6yfGla', net);

const privateKey = new Buffer('cf06f0b35515af10b5dfef470e3a1e743470bf9033d06f198b4e829cb2e7ef05', 'hex');

const privateKeyString = 'cf06f0b35515af10b5dfef470e3a1e743470bf9033d06f198b4e829cb2e7ef05';

//To connect to mainnet uncomment line below.
// const web3MainNet = new Web3('https://mainnet.infura.io/rqmgop6P5BDFqz6yfGla', http);

const abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "getId",
    "outputs": [
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_fName",
        "type": "string"
      },
      {
        "name": "_age",
        "type": "uint256"
      }
    ],
    "name": "setId",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0xD90e6dB4334B9Ad7FfC9538Aa157C8D5272D1Ad1';

const publicAddress = '0x37386A1c592Ad2f1CafFdc929805aF78C71b1CE7';

//IdContract Object
const IdContract = new web3.eth.Contract(abi, contractAddress);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      address: '',
      age: '',
      balance: '',
      balance2: '',
      firstName: '',
      gas: 	'',
      personsId: '',
      log: '',
      logColor: '',
      transactionHash: '',
    };
  }

  _setId = async () => {
    let { firstName, age } = this.state;
    age = parseInt(age);
    if(firstName && age) {
      const nonce = await web3.eth.getTransactionCount('0x37386A1c592Ad2f1CafFdc929805aF78C71b1CE7');
      const data = await IdContract.methods.setId(firstName, age).encodeABI();
      const gasPrice = await IdContract.methods.setId(firstName, age).estimateGas();
      const chainId = await web3.eth.net.getId()
      const rawTx = {
        nonce,
        gasPrice,
        gasLimit: 300000,
        gas: gasPrice + 200,
        from: publicAddress,
        to: contractAddress,
        value: 0.0000000001,
        data,
        chainId,
      };

      console.log('Nonce: ', nonce);
      console.log('GasPrice: : ', gasPrice);
      console.log('Data: ', data);
      console.log('PublicAddress: ', publicAddress);
      console.log('ContractAddress: ', contractAddress);
      console.log('Tx: ', rawTx);

      const tx = new Tx(rawTx);
      tx.sign(privateKey);

      const serializedTx = tx.serialize();

      web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('transactionHash', (txHash) => {
          console.log('TransactionHash:' , txHash);
          this.setState({log: 'Pending Transaction', logColor: 'red', transactionHash: txHash})})
        .on('receipt', (rec) => {
          console.log('Receipt:' , rec);
          this.setState({log: 'Transaction Complete', logColor: 'green', transactionHash: rec.transactionHash})
        })
    }
  };

  _estimateGas = () => {
    const { gas, firstName, age } = this.state;
    if (firstName && age) {
      IdContract.methods.setId(firstName, parseInt(age)).estimateGas().then(gas => this.setState({gas: gas}))
    }
  };

  _getFunction = () => {
    IdContract.methods.getId()
      .call().then((data) => this.setState({personsId: 'First Name: ' + data[0] + ', Age: ' + data[1]}))
  };

  _getBalance = () => {
    if (this.state.address) {
      web3.eth.getBalance(this.state.address).then((balance => this.setState({balance})));
      web3.eth.getBalance('0x37386A1c592Ad2f1CafFdc929805aF78C71b1CE7').then((balance2 => this.setState({balance2})));
    }
  };

  _checkTransaction = () => {
    const {transactionHash} = this.state;
    const url = 'https://ropsten.etherscan.io/tx/' + transactionHash;
    window.open(url, '_blank');
  };

  render() {
    const hello = 'hello';
    const { firstName, age, gas, balance, balance2, log, logColor, transactionHash } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">My ÐApp</h1>
        </header>
        <div className="Container">
          <h3>Enter in the First Name and Age of the ID you want displayed on the contract</h3>
          <div className="Row">
            <div className="Column">
              <input style={{margin: 20, height: 30, borderColor: 'grey', borderRadius: 4, fontSize: 20}} placeholder=" Enter First Name" type="text" onChange={(inputData) => this.setState({firstName: inputData.target.value})}/>
              <h3 style={{color: 'blue'}}>{'First Name: ' + firstName}</h3>
            </div>
            <div className="Column">
              <input style={{margin: 20, height: 30, borderColor: 'grey', borderRadius: 4, fontSize: 20}} placeholder="Enter Age" type="text" onChange={(inputData) => this.setState({age: inputData.target.value})}/>
              <h3 style={{color: 'blue'}}>{'Age: ' + age}</h3>
            </div>
          </div>
          <div className="Column">
            <div className="Row">
              <button style={{backgroundColor: 'magenta', borderRadius: 4, height: 30, color: 'white', border: 'none', fontSize: 20, margin: 20}} onClick={this._setId}>Set Id {firstName ? ` to be ${firstName}, ${age}` : ''}</button>
              <button style={{backgroundColor: 'black', borderRadius: 4, height: 30, color: 'white', border: 'none', fontSize: 20, margin: 20}} onClick={this._estimateGas}>Estimate Gas</button>
            </div>
            <br/>
            <h3 style={{color: 'blue'}}>{'Gas Cost: ' + gas}</h3>
          </div>
          <h3>Click GetID to see the ID saved on the contract</h3>
          <button style={{backgroundColor: 'magenta', borderRadius: 4, height: 30, color: 'white', border: 'none', fontSize: 20}} onClick={this._getFunction}>GetId</button>
          <h3 style={{color: 'blue'}}>{`ID: ${this.state.personsId}`}</h3>
          <br/>
          <h3>Enter a Ropsten Address to view balance</h3>
          <input style={{margin: 20, height: 30, borderColor: 'grey', borderRadius: 4, fontSize: 20}} type="text" placeholder="Enter rETH address" onChange={(data) => this.setState({address: data.target.value})}/>
          <button style={{backgroundColor: 'magenta', borderRadius: 4, height: 30, color: 'white', border: 'none', fontSize: 20, shadowColor: 'black', shadowOpacity: 1.0}} onClick={this._getBalance}>GetBalance</button>
          <h3 style={{color: 'blue'}}>{balance ? parseInt(balance)/10e17 + ' rETH' : 'No balance yet'}</h3>
          <div className="Column">
            <h1>Log</h1>
            {transactionHash &&
            <div className="Row">
              <h4 style={{color: logColor}}>{log + ': '}{transactionHash}</h4>
              <button onClick = {this._checkTransaction} style={{backgroundColor: logColor, borderRadius: 4, height: 30, color: 'white', border: 'none', fontSize: 20, margin: 20}}>View</button>
            </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default App;
