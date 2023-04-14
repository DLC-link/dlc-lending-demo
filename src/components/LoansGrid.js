/*global chrome*/

import React from 'react';
import {
    VStack,
    HStack,
    Collapse,
    SimpleGrid,
    ScaleFade,
} from '@chakra-ui/react';
import Card from './Cards/Card';
import SetupVaultCard from './Cards/SetupVaultCard';
import { useSelector } from 'react-redux';

export default function LoansGrid() {
    const loans = useSelector((state) => state.loans.loans);
    const address = useSelector((state) => state.account.address);
    const isLoading = useSelector((state) => state.vaults.status === 'loading');

    return (
        <>
            <Collapse in={address}>
                <VStack justifyContent="center" alignContent="center">
                    <HStack></HStack>
                    <ScaleFade in={!isLoading}>
                        <SimpleGrid columns={[1, 4]} spacing={[0, 15]}>
                            <SetupVaultCard></SetupVaultCard>
                            {loans?.map((loan, i) => (
                                <Card key={i} vaultUUID={loan.uuid}></Card>
                            ))}
                        </SimpleGrid>
                    </ScaleFade>
                </VStack>
            </Collapse>
        </>
    );
}
