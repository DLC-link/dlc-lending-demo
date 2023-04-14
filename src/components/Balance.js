import React from 'react';
import { Text, HStack, Flex, Spacer } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
// import { selectTotalRedeemable, selectTotalNFTs } from '../store/loansSlice';
import { customShiftValue } from '../utilities/formatFunctions';

export default function Balance() {
    // const totalRedeemable = useSelector(selectTotalRedeemable);
    // const numberOfNFTs = useSelector(selectTotalNFTs);
    // return (
    //     <>
    //         <>
    //             <Flex
    //                 padding='15px'
    //                 height="auto"
    //                 width="350px"
    //                 border="1px"
    //                 borderRadius="lg"
    //                 borderColor="white"
    //                 shadow="dark-lg"
    //             >
    //                 <HStack justifyContent={'space-between'}>
    //                     <Text
    //                         fontSize="small"
    //                         fontWeight="extrabold"
    //                         color="accent"
    //                     >
    //                         Total Redeemable:{' '}
    //                     </Text>
    //                     <Text>
    //                         {customShiftValue(totalRedeemable, 8, true)} BTC
    //                     </Text>
    //                     <Spacer width={'15px'}></Spacer>
    //                     <Text
    //                         fontSize="small"
    //                         fontWeight="extrabold"
    //                         color="accent"
    //                     >
    //                         Owned NFTs:{' '}
    //                     </Text>
    //                     <Text>{numberOfNFTs}</Text>
    //                 </HStack>
    //             </Flex>
    //         </>
    //     </>
    // );
}
