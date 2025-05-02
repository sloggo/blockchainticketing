import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CreateWallet from "./pages/wallet/CreateWallet";
import WalletBalance from "./pages/wallet/WalletBalance";
import Wallet from "./pages/wallet/Wallet";
import Web3 from "web3";
import { WalletProvider } from "./context/WalletContext";

function App() {
  const web3 = new Web3(process.env.REACT_APP_WEB3_PROVIDER_URL);

  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wallet" element={<Wallet />}>
            <Route path="create" element={<CreateWallet web3={web3} />} />
            <Route path="balance" element={<WalletBalance web3={web3} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
