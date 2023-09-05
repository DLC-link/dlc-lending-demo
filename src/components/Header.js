import React from 'react';
import { HStack, Box, Flex } from '@chakra-ui/react';
import Account from './Account';
import CompanyWebsiteButton from './CompanyWebsiteButton';

export default function Header() {
  return (
    <Flex
      flexDirection={'row'}
      margin={25}
      justifyContent={'space-between'}>
      <CompanyWebsiteButton />
      <Account />
    </Flex>
  );
}
