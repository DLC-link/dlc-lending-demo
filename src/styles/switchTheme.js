import { switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(switchAnatomy.keys);

const baseStyle = definePartsStyle({
  // define the part you're going to style
  container: {
    // ...
  },
  thumb: {
    bg: 'white',
  },
  track: {
    bg: '#FF4500',
    _checked: {
      bg: '#04BAB2',
    },
  },
});

export const switchTheme = defineMultiStyleConfig({ baseStyle });
