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
    borderColor: 'accent',
    bg: 'transparent',
    _hover: {
      color: 'white',
      bg: 'accent',
    },
  },
  list: {
    borderRadius: 'md',
    border: '1px',
    borderColor: 'accent',
    bg: 'white', 
    width: '250px'
  },
  item: {
    bg: 'transparent',
    justifyContent:'center',
    _hover: {
      bg: 'accent',
    },
  },
});
export const menuTheme = defineMultiStyleConfig({ baseStyle });
