import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TransferToken from './TransferToken';
import { WalletProvider } from '../../context/WalletContext';

jest.mock('../../utils/formatAddress', () => ({
  formatAddress: jest.fn(address => address)
}));

const mockWeb3 = {
  eth: {
    getBalance: jest.fn().mockResolvedValue('5000000000000000000'),
    getGasPrice: jest.fn().mockResolvedValue('20000000000'),
    accounts: {
      decrypt: jest.fn().mockResolvedValue({
        address: '0xtestacc123456789',
        privateKey: '0xprivatekey123'
      }),
      signTransaction: jest.fn().mockResolvedValue({
        rawTransaction: '0xsignedtx123'
      })
    },
    sendSignedTransaction: jest.fn().mockResolvedValue({
      transactionHash: '0xtxhash123',
      status: true
    }),
    Contract: jest.fn(() => ({
      methods: {
        balanceOf: jest.fn(() => ({
          call: jest.fn().mockResolvedValue('1000000000000000000')
        })),
        approve: jest.fn().mockImplementation(() => ({
          encodeABI: jest.fn().mockReturnValue('0xapproveABI')
        })),
        transfer: jest.fn().mockImplementation(() => ({
          encodeABI: jest.fn().mockReturnValue('0xtransferABI')
        }))
      }
    }))
  },
  utils: {
    fromWei: jest.fn().mockReturnValue('5'),
    toWei: jest.fn(val => (parseInt(val) * 1000000000000000000).toString())
  }
};

const mockLocalStorage = (() => {
  let store = {
    wallet: JSON.stringify({
      address: '0xtestacc123456789',
      isLoggedIn: true,
      keystore: { address: '0xtestacc123456789', crypto: {} }
    })
  };
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn()
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
window.prompt = jest.fn().mockReturnValue('password123');
window.alert = jest.fn();

process.env.REACT_APP_CONTRACT_ADDRESS = '0xcontract123456789';

describe('TransferToken Component', () => {
  test('renders loading state', () => {
    process.env.REACT_APP_CONTRACT_ADDRESS = '0xcontract123';
    
    render(<TransferToken web3={mockWeb3} />);
    expect(screen.getByText(/loading token information/i)).toBeInTheDocument();
  });

  test('fetchBalances calls web3 methods correctly', async () => {
    render(
      <BrowserRouter>
        <WalletProvider>
          <TransferToken web3={mockWeb3} />
        </WalletProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockWeb3.eth.getBalance).toHaveBeenCalledWith('0xtestacc123456789');
      expect(mockWeb3.eth.Contract).toHaveBeenCalled();
    });
  });

  test('transferTokens executes full transfer flow correctly', async () => {
    render(
      <BrowserRouter>
        <WalletProvider>
          <TransferToken web3={mockWeb3} />
        </WalletProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sell Tokens/)).toBeInTheDocument();
    });

    const amountInput = screen.getByPlaceholderText('Enter number of tokens to sell');
    fireEvent.change(amountInput, { target: { value: '5' } });

    const sellButton = screen.getByText('Sell Tokens');
    fireEvent.click(sellButton);

    await waitFor(() => {
      expect(mockWeb3.eth.accounts.decrypt).toHaveBeenCalled();
      
      expect(mockWeb3.eth.getGasPrice).toHaveBeenCalled();
      expect(mockWeb3.eth.accounts.signTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: '0xapproveABI'
        }),
        '0xprivatekey123'
      );
      
      expect(mockWeb3.eth.sendSignedTransaction).toHaveBeenCalledWith('0xsignedtx123');
      
      expect(mockWeb3.eth.accounts.signTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          data: '0xtransferABI'
        }),
        '0xprivatekey123'
      );
      
      expect(mockWeb3.eth.sendSignedTransaction).toHaveBeenCalledWith('0xsignedtx123');
      
      expect(mockWeb3.eth.getBalance).toHaveBeenCalledTimes(2);
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Transaction hash'));
    });
  });
});