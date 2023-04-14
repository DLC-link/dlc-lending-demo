import React from 'react';
import { Button, HStack, Image, Spacer } from '@chakra-ui/react';
import Account from './Account';

export default function Header() {
    return (
        <>
            <HStack margin={['15px', '30px']}>
                <Button
                    variant="ghost"
                    as="a"
                    margin="0px"
                    boxSize={['65px', '97.5px']}
                    borderRadius="lg"
                    href="https://www.dlc.link/"
                    _hover={{
                        background: 'secondary1',
                    }}
                >
                    <Image src="/dlc.link_logo.svg" alt="DLC.Link Logo" />
                </Button>
                <Spacer></Spacer>
                <Account></Account>
            </HStack>
        </>
    );
}
