import { Button, HStack, Image, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVaultReserves, fetchOutstandingDebt, fetchVdlcBtcBalance } from '../store/externalDataSlice';

import { useEffect } from 'react';
import { useLoans } from '../hooks/useLoans';
import { toggleBorrowModalVisibility, toggleRepayModalVisibility } from '../store/componentSlice';

export default function StableCoinBalance() {
  const dispatch = useDispatch();
  const loans = useLoans();

  const { outstandingDebt, vaultReserves, vDlcBtcBalance } = useSelector((state) => state.externalData);

  const vaults = [{ baseToken: 'dlcBTC', borrowToken: 'USDC' }];

  const getCorrespondingAssetIcon = (asset) => {
    switch (asset) {
      case 'dlcBTC':
        return (
          <Image
            src='https://cdn.discordapp.com/attachments/994505799902691348/1035507437748367360/DLC.Link_Emoji.png'
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

  const AssetTableRow = ({ baseToken, borrowToken }) => {
    return (
      <Tr>
        <Td>
          <HStack>
            <AssetIcon asset={baseToken} />
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
          <Button
            variant={'deposit-withdraw'}
            onClick={() =>
              dispatch(
                toggleBorrowModalVisibility({
                  vaultForModal: { baseToken: 'dlcBTC', borrowToken: 'USDC' },
                  isOpen: true,
                })
              )
            }>
            BORROW
          </Button>
        </Td>
        <Td>
          <Button
            variant={'deposit-withdraw'}
            onClick={() =>
              dispatch(
                toggleRepayModalVisibility({
                  vaultForModal: { baseToken: 'dlcBTC', borrowToken: 'USDC' },
                  isOpen: true,
                })
              )
            }>
            REPAY
          </Button>
        </Td>
      </Tr>
    );
  };
  return (
    <AssetTableContainer>
      <TableContainer width={925}>
        <Table>
          <Thead>
            <Tr>
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
            </Tr>
          </Thead>
          <Tbody>
            {vaults.map((vault, index) => (
              <AssetTableRow
                key={index}
                baseToken={vault.baseToken}
                borrowToken={vault.borrowToken}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </AssetTableContainer>
  );
}
