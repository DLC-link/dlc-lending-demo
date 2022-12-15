import SelectWalletModal from "./modals/SelectWalletModal";
import eventBus from "./EventBus";
import DepositWithdraw from "./components/DepositWithdraw";
import Header from "./components/Header";
import Intro from "./components/Intro";
import React, { useEffect } from "react";
import DepositModal from "./modals/DepositModal";
import DLCTable from "./components/DLCTable";
import { Box, useToast } from "@chakra-ui/react";
import { useState } from "react";
import CustomToast from "./components/CustomToast";

export default function App() {
  const [isConnected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [walletType, setWalletType] = useState("");
  const [isLoading, setLoading] = useState(true);
  const [isSelectWalletModalOpen, setSelectWalletModalOpen] = useState(false);
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    eventBus.on("is-account-connected", (data) =>
      setConnected(data.isConnected)
    );
    eventBus.on("fetch-loans-bg", (data) => {
      handleEvent(data);
    });
    eventBus.on("loan-event", (data) => {
      handleEvent(data);
    });
    eventBus.on("set-address", (data) => setAddress(data.address));
    eventBus.on("wallet-type", (data) => setWalletType(data.walletType));
    eventBus.on("set-loading-state", (data) => setLoading(data.isLoading));
    eventBus.on("is-select-wallet-modal-open", (data) =>
      setSelectWalletModalOpen(data.isSelectWalletOpen)
    );
    eventBus.on("is-deposit-modal-open", (data) =>
      setDepositModalOpen(data.isDepositOpen)
    );
  }, [walletType]);

  const onSelectWalletModalClose = () => {
    setSelectWalletModalOpen(false);
  };

  const onDepositModalClose = () => {
    setDepositModalOpen(false);
  };

  const handleEvent = (data) => {
    const toastMap = {
      created: {
        message: "Loan created!",
        id: 1,
      },
      cancelled: {
        message: "Transaction cancelled!",
        id: 2,
      },
      setup: {
        message: "Loan established!",
        id: 3,
      },
      ready: {
        message: "Loan is ready!",
        id: 4,
      },
      "repay-requested": {
        message: "Requested repayment!",
        id: 5,
      },
      repaying: {
        message: "Processing repayment!",
        id: 5,
      },
      repaid: {
        message: "Loan repaid!",
        id: 6,
      },
      "liquidation-requested": {
        message: "Requested liquidation!",
        id: 7,
      },
      liquidateing: {
        message: "Processing liquidation!",
        id: 8,
      },
      liquidated: {
        message: "Loan liquidated!",
        id: 9,
      },
      funded: {
        message: "Loan funded!",
        id: 10,
      },
      closed: {
        message: "Loan closed!",
        id: 11,
      },
      "approve-requested": {
        message: "Approve requested!",
        id: 12,
      },
      approved: {
        message: "Approved!",
        id: 13,
      },
    };

    let success = !(data.status === "cancelled");
    let message = toastMap[data.status].message;
    let explorerAddress;

    switch (walletType) {
      case "hiro":
        explorerAddress = `https:/https://explorer.stacks.co/txid/${data.txId}`;
        break;
      case "metamask":
        explorerAddress = `https://goerli.etherscan.io/tx/${data.txId}`;
        break;
    }

    if (!toast.isActive(toastMap[data.status].id))
      return toast({
        id: toastMap[data.status].id,
        position: "right-top",
        render: () => (
          <CustomToast
            explorerAddress={explorerAddress}
            message={message}
            success={success}
          ></CustomToast>
        ),
      });
  };

  return (
    <>
      <Box height="auto" padding={0}>
        <Header
          isConnected={isConnected}
          walletType={walletType}
          address={address}
        ></Header>
        <DepositModal
          walletType={walletType}
          address={address}
          isOpen={isDepositModalOpen}
          closeModal={onDepositModalClose}
        />
        <SelectWalletModal
          isOpen={isSelectWalletModalOpen}
          closeModal={onSelectWalletModalClose}
        />
        <Intro isConnected={isConnected}></Intro>
        {isConnected && (
          <>
            <DepositWithdraw
              isConnected={isConnected}
              isLoading={isLoading}
            ></DepositWithdraw>
            <DLCTable
              isConnected={isConnected}
              walletType={walletType}
              address={address}
              isLoading={isLoading}
            ></DLCTable>
          </>
        )}
      </Box>
    </>
  );
}
