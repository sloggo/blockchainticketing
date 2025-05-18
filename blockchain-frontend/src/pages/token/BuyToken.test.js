import React from 'react';
import { render } from '@testing-library/react';

jest.mock('../../context/WalletContext', () => ({
  useWallet: () => ({
    wallet: { address: '0xtest123' },
    setWallet: jest.fn()
  })
}));

jest.mock('../../utils/formatAddress', () => ({
  formatAddress: (address) => address
}));

const mockWeb3 = {
  eth: {
    Contract: () => ({
      methods: {
        balanceOf: () => ({
          call: jest.fn().mockResolvedValue('1000')
        })
      }
    }),
    getBalance: jest.fn().mockResolvedValue('2000')
  },
  utils: {
    fromWei: jest.fn(val => val)
  }
};

const BuyToken = require('./BuyToken').default;

describe('BuyToken Component', () => {
  test('renders without crashing', () => {
    process.env.REACT_APP_CONTRACT_ADDRESS = '0xcontract123';
    
    const { container } = render(<BuyToken web3={mockWeb3} />);
    expect(container).toBeTruthy();
  });
});