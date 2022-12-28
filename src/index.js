import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { theme } from './styles/theme';

import '@fontsource/poppins';
import App from './App';
import startObserver from './observer';

startObserver();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ChakraProvider
    resetCSS
    theme={theme}>
    <App />
  </ChakraProvider>
);
