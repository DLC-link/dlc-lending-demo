import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  button: {
    padding: '15px',
    width: '250px',
    shadow: '2xl',
    borderRadius: 'md',
    border: '1px',
    borderColor: 'white',
    bg: 'background2',
    _hover: {
      borderColor: 'accent',
    },
  },
  list: {
    padding: '1px',
    borderRadius: 'sm',
    border: '1px',
    borderColor: 'accent',
    width: '250px',
    bg: 'background2',
    dropShadow: '2xl',
  },
  item: {
    color: 'white',
    bg: 'background2',
    padding: '15px',
    justifyContent: 'center',
    fontWeight: 'extrabold',
    _hover: {
      color: 'accent',
    },
  },
});
export const menuTheme = defineMultiStyleConfig({ baseStyle });
