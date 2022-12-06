import { extendTheme } from "@chakra-ui/react";

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
    background2: "#000933",
  },

  fonts: {
    body: "'Poppins', poppins",
  },
});
