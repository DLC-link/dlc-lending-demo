import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  styles: {
    global: () => ({
      body: {
        bgGradient: "linear(to-r, background1, background2)",
      },
    }),
  },

  colors: {
    primary1: "#93009E",
    primary2: "#001FBA",
    secondary1: "#04BAB2",
    secondary2: "#2C039E",
    accent: "#07E8D8",
    background1: "#500056",
    background2: "#001372"
  },

  fonts: {
    body: "'Poppins', poppins"
  },

  // textStyles: {
  //   header: {
  //     fontSize: ['48px', '72px'],
  //     fontWeight: 'bold',
  //     lineHeight: '110%',
  //     letterSpacing: '-2%',
  //   },
  //   button: {
  //     fontSize: ['36px', '48px'],
  //     fontWeight: 'semibold',
  //     lineHeight: '110%',
  //     letterSpacing: '-1%',
  //   },
  // },
});