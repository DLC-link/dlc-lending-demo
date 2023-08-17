import React from 'react';
import { Button, HStack, Image, Spacer } from '@chakra-ui/react';
import Account from './Account';

export default function Header() {
  const CompanyIcon = () => {
    return (
      <Button
        variant='ghost'
        as='a'
        boxSize={['65px', '97.5px']}
        borderRadius='lg'
        href='https://www.dlc.link/'
        _hover={{
          background: 'secondary1',
        }}>
        <Image
          src='/dlc.link_logo.svg'
          alt='DLC.Link Logo'
        />
      </Button>
    );
  };

  return (
    <HStack margin={['15px', '30px']}>
      <CompanyIcon />
      <Spacer />
      <Account />
    </HStack>
  );
}
