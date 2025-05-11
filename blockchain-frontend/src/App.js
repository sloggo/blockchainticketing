import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from "./pages/Home";
import CreateWallet from "./pages/wallet/CreateWallet";
import WalletBalance from "./pages/wallet/WalletBalance";
import Wallet from "./pages/wallet/Wallet";
import Web3 from "web3";
import { WalletProvider } from "./context/WalletContext";
import Token from "./pages/token/Token";
import BuyToken from "./pages/token/BuyToken";
import TransferToken from "./pages/token/TransferToken";

function App() {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://holesky.drpc.org'));
  const [userRole, setUserRole] = useState('customer');

  return (
    <Router>
      <WalletProvider>
        <div>
          <nav style={{ 
            display: 'flex', 
            gap: '20px', 
            padding: '20px',
            marginBottom: '20px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', borderRadius: '5px' }}>
                Home
              </Link>
              <Link to="/wallet" style={{ textDecoration: 'none', borderRadius: '5px' }}>
                Wallet
              </Link>
              <Link to="/token" style={{ textDecoration: 'none', borderRadius: '5px' }}>
                Tokens
              </Link>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wallet" element={<Wallet />}>
              <Route path="create" element={<CreateWallet web3={web3} />} />
              <Route path="balance" element={<WalletBalance web3={web3} />} />
            </Route>
            <Route path="/token" element={<Token />}>
              <Route path="buy" element={<BuyToken web3={web3} />} />
              <Route path="transfer" element={<TransferToken web3={web3} />} />
            </Route>
          </Routes>
        </div>
      </WalletProvider>
    </Router>
  );
}

export default App;
