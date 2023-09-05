import { Button, Image } from '@chakra-ui/react';

export default function CompanyWebsiteButton() {
  return (
    <Button
      variant='ghost'
      as='a'
      boxSize={[65, 100]}
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
}
