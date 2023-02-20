import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { appTheme } from './styles/appTheme';

import '@fontsource/poppins';
import App from './App';
import startObserver from './observer';

startObserver();

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ChakraProvider
    resetCSS
    theme={appTheme}>
    <App />
  </ChakraProvider>
);
