import { Button, Image } from '@chakra-ui/react';

export default function CompanyWebsiteButton() {
  return (
    <Button
      as={'a'}
      href='https://www.dlc.link/'
      variant={'ghost'}
      padding={0}
      boxSize={[50, 100]}
      _hover={{
        background: 'accent',
      }}>
      <Image
        src='/dlc.link_logo.svg'
        alt='DLC.Link Logo'
        boxSize={[50, 100]}
      />
    </Button>
  );
}
