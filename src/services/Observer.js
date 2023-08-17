import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { startEthereumObserver } from './EthereumObserver';
import { startStacksObserver } from './StacksObserver';

export default function Observer() {
  const address = useSelector((state) => state.account.address);
  const walletType = useSelector((state) => state.account.walletType);
  const blockchain = useSelector((state) => state.account.blockchain);

  useEffect(() => {
    if (address && walletType && blockchain) {
      switch (walletType) {
        case 'metamask':
          startEthereumObserver(blockchain);
          break;
        case 'hiro':
        case 'xverse':
          startStacksObserver(blockchain);
          break;
        default:
          throw new Error('Unknown wallet type!');
      }
    }
  }, [address, walletType, blockchain]);
}
