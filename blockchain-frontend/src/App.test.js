import { render, screen } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ children }) => <div>{children}</div>,
  Link: ({ children }) => <div>{children}</div>
}));

jest.mock('./pages/Home', () => () => <div>Home</div>);
jest.mock('./pages/wallet/CreateWallet', () => () => <div>CreateWallet</div>);
jest.mock('./pages/wallet/WalletBalance', () => () => <div>WalletBalance</div>);
jest.mock('./pages/wallet/Wallet', () => () => <div>Wallet</div>);
jest.mock('./pages/token/Token', () => () => <div>Token</div>);
jest.mock('./pages/token/BuyToken', () => () => <div>BuyToken</div>);
jest.mock('./pages/token/TransferToken', () => () => <div>TransferToken</div>);

jest.mock('./context/WalletContext', () => ({
  WalletProvider: ({ children }) => <div>{children}</div>
}));

test('renders without crashing', () => {
  const App = require('./App').default;
  render(<App />);
  expect(screen.getByText(/Home/i)).toBeInTheDocument();
});
