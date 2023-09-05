import { extendTheme } from '@chakra-ui/react';
import { menuTheme } from './menuTheme';
import { switchTheme } from './switchTheme';

export const appTheme = extendTheme({
  components: {
    Switch: switchTheme,
    Menu: menuTheme,
    Tooltip: {
      baseStyle: {
        fontSize: 'xs',
        textAlign: 'justify',
        padding: '5px',
        background: 'transparent',
        border: '1px solid #07E8D8',
        borderRadius: 'lg',
        shadow: 'dark-lg',
      },
      variants: {
        warning: {
          border: '1px solid #FF4500',
        },
      },
    },
    Text: {
      baseStyle: {
        fontSize: '12px',
        fontWeight: 'normal',
        color: 'white',
      },
      variants: {
        selector: {
          fontSize: 'md',
          fontWeight: 'extrabold',
          color: 'white',
        },
        value: {
          fontWeight: 'extrabold',
        },
        tutorial: {
          fontSize: 'sm',
          fontWeight: 'bold',
          textAlign: 'justify',
        },
        connect: {
          fontSize: ['xs', 'xl'],
          fontWeight: 'extrabold',
        },
      },
    },
    FormLabel: {
      baseStyle: {
        marginTop: '25px',
        marginLeft: '50px',
        marginRight: '50px',
        bgGradient: 'linear(to-r, primary1, primary2)',
        bgClip: 'text',
      },
      FormHelperText: {
        styles: {
          myFormHelperText: {
            fontSize: 'x-small',
            marginTop: '15px',
            marginBottom: '15px',
            marginLeft: '50px',
          },
        },
      },
    },
    Button: {
      baseStyle: {
        margin: '5px',
        width: '200px',
        shadow: '2xl',
        fontSize: 'sm',
        fontWeight: 'bold',
      },
      variants: {
        outline: {
          fontSize: 'sm',
          color: 'white',
          bg: 'transparent',
          borderColor: 'accent',
          transition: 'all .25s ease',
          _hover: {
            bg: 'secondary1',
            borderColor: 'white',
            transform: 'translateY(-2.5px)',
          },
        },
        uuid: {
          justifyContent: 'left',
          margin: '0px',
          padding: '0px',
          width: '25px',
          height: '1.5px',
        },
        connect: {
          _hover: {
            background: 'secondary1',
          },
          height: ['25px', '50px'],
          width: ['175px', '250px'],
          shadow: 'dark-lg',
          bgGradient: 'linear(to-r, primary1, primary2)',
        },
      },
    },
  },
  styles: {
    global: () => ({
      body: {
        bgGradient: 'linear(to-r, background1, background2)',
      },
    }),
  },

  colors: {
    primary1: '#93009E',
    primary2: '#001FBA',
    secondary1: '#04BAB2',
    secondary2: '#2C039E',
    accent: '#07E8D8',
    background1: '#500056',
    background2: '#000933',
    warning: '#FF4500',
    header: '#9ac9ff',
  },

  fonts: {
    body: "'Poppins', poppins",
  },
});
