import React from 'react';
import { render } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn()
}));

jest.mock('../../context/WalletContext', () => ({
  useWallet: () => ({
    wallet: null,
    setWallet: jest.fn()
  })
}));

const CreateWallet = require('./CreateWallet').default;

describe('CreateWallet Component', () => {
  test('renders without crashing', () => {
    const { container } = render(<CreateWallet />);
    expect(container).toBeTruthy();
  });
});
