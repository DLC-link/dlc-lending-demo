import { Button, HStack, Image, Table, TableContainer, Td, Text, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOutstandingDebt, fetchVdlcBtcBalance } from '../store/externalDataSlice';

import { useEffect } from 'react';
import { useLoans } from '../hooks/useLoans';
import { fetchVaultReserves } from '../store/externalDataSlice';

export default function StableCoinBalance() {
  const dispatch = useDispatch();
  const loans = useLoans();

  const { outstandingDebt, vaultReserves, vDlcBtcBalance } = useSelector((state) => state.externalData);

  const vaults = [{ depositToken: 'BTC', borrowToken: 'USDC' }];

  const getCorrespondingAssetIcon = (asset) => {
    switch (asset) {
      case 'BTC':
        return (
          <Image
            src='/btc_logo.png'
            alt='Bitcoin Logo'
            boxSize={15}
          />
        );
      case 'USDC':
        return (
          <Image
            src='/usdc_logo.png'
            alt='USDC Logo'
            boxSize={15}
          />
        );
      default:
        return '/btc_logo.png';
    }
  };

  const AssetIcon = ({ asset }) => {
    return getCorrespondingAssetIcon(asset);
  };

  useEffect(() => {
    dispatch(fetchVaultReserves());
    dispatch(fetchOutstandingDebt());
    dispatch(fetchVdlcBtcBalance());
  }, [outstandingDebt, dispatch, loans]);

  const AssetTableContainer = ({ children }) => {
    return (
      <HStack
        padding={15}
        width={925}
        borderRadius={'lg'}
        shadow={'dark-lg'}
        justifyContent={'space-evenly'}>
        {children}
      </HStack>
    );
  };

  const AssetTableRow = ({ depositToken, borrowToken }) => {
    return (
      <Tr>
        <Td>
          <HStack>
            <AssetIcon asset={depositToken} />
            <AssetIcon asset={borrowToken} />
            <Text>dlcBTC • USDC</Text>
          </HStack>
        </Td>
        <Td>
          <Text>$ {new Intl.NumberFormat().format(vaultReserves)}</Text>
        </Td>
        <Td>
          <Text>$ {new Intl.NumberFormat().format(outstandingDebt)}</Text>
        </Td>
        <Td>
          <Text>{vDlcBtcBalance}</Text>
        </Td>
        <Td>
          <Button variant={'deposit-withdraw'}>DEPOSIT</Button>
        </Td>
        <Td>
          <Button variant={'deposit-withdraw'}>WITHDRAW</Button>
        </Td>
      </Tr>
    );
  };
  return (
    <AssetTableContainer>
      <TableContainer width={925}>
        <Table>
          <Thead>
            <Td>
              <Text
                fontSize={'xs'}
                fontWeight={'bold'}
                color={'white'}>
                Vault
              </Text>
            </Td>
            <Td>
              <Text
                fontSize={'xs'}
                fontWeight={'bold'}
                color={'white'}>
                Vault Reserves
              </Text>
            </Td>
            <Td>
              <Text
                fontSize={'xs'}
                fontWeight={'bold'}
                color={'white'}>
                Borrowed USDC
              </Text>
            </Td>
            <Td>
              <Text
                fontSize={'xs'}
                fontWeight={'bold'}
                color={'white'}>
                Deposited dlcBTC
              </Text>
            </Td>
            <Td></Td>
            <Td></Td>
          </Thead>
          {vaults.map((vault) => (
            <AssetTableRow
              depositToken={vault.depositToken}
              borrowToken={vault.borrowToken}
            />
          ))}
        </Table>
      </TableContainer>
    </AssetTableContainer>
  );
}
