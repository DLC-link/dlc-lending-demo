import React from "react";
import eventBus from "../EventBus";
import { Button, Text, HStack, Flex, Image, Spacer } from "@chakra-ui/react";
import { userSession } from "../hiroWalletUserSession";
import Account from "./Account";

export default function Header({ address, isConnected, walletType }) {
  const disconnect = () => {
    if (walletType === "hiro") {
      userSession.signUserOut("/");
    }
    eventBus.dispatch("set-address", { address: "" });
    eventBus.dispatch("is-account-connected", { isConnected: false });
  };

  const openSelectWalletModal = () => {
    eventBus.dispatch("is-select-wallet-modal-open", {
      isSelectWalletOpen: true,
    });
  };

  return (
    <>
      <HStack
        height="auto"
        width="auto"
        spacing={[5, 55]}
        marginTop={[5, 25]}
        marginBottom={[5, 25]}
        marginLeft={5}
        marginRight={25}
      >
        <Button
          as="a"
          href="https://www.dlc.link/"
          _hover={{
            background: "none",
          }}
          variant="ghost"
          height={[25, 65]}
          width={100}
        >
          <Image
            src="/dlc.link_logo.svg"
            alt="DLC.Link Logo"
            height={[25, 65]}
            width={[25, 65]}
          />
        </Button>
        <Spacer></Spacer>
        {!isConnected ? (
          <Button variant="connect" onClick={openSelectWalletModal}>
            <Text variant="connect">Connect Wallet</Text>
          </Button>
        ) : (
          <Button
            variant="connect"
            bgGradient="linear(to-r, primary1, primary2)"
            onClick={disconnect}
          >
            <Text variant="connect">
              Disconnect
            </Text>
          </Button>
        )}
        <Account
          address={address}
          isConnected={isConnected}
          walletType={walletType}
        ></Account>
      </HStack>
    </>
  );
}
