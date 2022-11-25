import SelectWalletModal from "./modals/SelectWalletModal";
import eventBus from "./EventBus";
import DepositWithdraw from "./components/DepositWithdraw";
import Header from "./components/Header";
import Intro from "./components/Intro";
import React from "react";
import DepositModal from "./modals/DepositModal";
import DLCTable from "./components/DLCTable";
import { Box } from "@chakra-ui/react";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isSelectWalletOpen: false,
      isDepositOpen: false,
      isConnected: false,
      isLoading: true,
      address: "",
    };
  }

  componentDidMount = () => {
    eventBus.on("is-select-wallet-modal-open", (data) =>
      this.setState({ isSelectWalletOpen: data.isSelectWalletOpen })
    );
    eventBus.on("is-deposit-modal-open", (data) =>
      this.setState({ isDepositOpen: data.isDepositOpen })
    );
  };

  componentDidUpdate = () => {
    eventBus.on(
      "account-connected",
      (data) =>
        this.state.isConnected !== data.isConnected &&
        this.setState({ isConnected: data.isConnected })
    );
    eventBus.on(
      "change-address",
      (data) =>
        this.state.address !== data.address &&
        this.setState({ address: data.address })
    );
  };

  onSelectWalletClose = () => {
    this.setState({ isSelectWalletOpen: false });
  };

  onDepositClose = () => {
    this.setState({ isDepositOpen: false });
  };

  render() {
    return (
      <>
        <Box height="auto">
          <Header></Header>
          <DepositModal
            isOpen={this.state.isDepositOpen}
            closeModal={this.onDepositClose}
          />
          <SelectWalletModal
            isOpen={this.state.isSelectWalletOpen}
            closeModal={this.onSelectWalletClose}
          />
          <Intro isConnected={this.state.isConnected}></Intro>
          {this.state.isConnected && (
            <>
              <DepositWithdraw
                isConnected={this.state.isConnected}
              ></DepositWithdraw>
              <DLCTable
                isConnected={this.state.isConnected}
                address={this.state.address}
              ></DLCTable>
            </>
          )}
        </Box>
      </>
    );
  }
}
