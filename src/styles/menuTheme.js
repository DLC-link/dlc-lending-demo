import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  button: {
    padding: '15px',
    width: '250px',
    shadow: '2xl',
    borderRadius: 'md',
    border: '1px',
    bg: 'transparent',
    _hover: {
      color: 'white',
      bg: 'accent',
    },
  },
  list: {
    borderRadius: 'xl',
    border: 'none',
    bg: 'white',
    size: 'xxl',    
  },
  item: {
    color: 'accent',
    bg: 'transparent',
    _hover: {
      color: 'white',
      bg: 'accent',
    },
    _focus: {
      color: 'white',
      bg: 'accent',
    },
  },
});
export const menuTheme = defineMultiStyleConfig({ baseStyle });
