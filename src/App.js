import SelectWalletModal from "./modals/SelectWalletModal";
import eventBus from "./EventBus";
import DepositWithdraw from "./components/DepositWithdraw";
import Header from "./components/Header";
import Intro from "./components/Intro"
import React from "react";
import DepositModal from "./modals/DepositModal";
import Footer from "./components/Footer"
import DLCTable from "./components/DLCTable";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isSelectWalletOpen: false,
      isDepositOpen: false,
      isConnected: false
    };
  }

  componentDidMount = () => {
    eventBus.on("account-connected", (data) =>
      this.setState({ isConnected: data.isConnected })
    );
    eventBus.on("is-select-wallet-modal-open", (data) =>
      this.setState({ isSelectWalletOpen: data.isSelectWalletOpen })
    );
    eventBus.on("is-deposit-modal-open", (data) =>
      this.setState({ isDepositOpen: data.isDepositOpen })
    );
  }

  onSelectWalletClose = () => {
    this.setState({ isSelectWalletOpen: false })
  }

  onDepositClose = () => {
    this.setState({ isDepositOpen: false })
  }

  render() {
    return (
      <>
        <Header></Header>
        <SelectWalletModal isOpen={this.state.isSelectWalletOpen} closeModal={this.onSelectWalletClose} />
        <DepositModal isOpen={this.state.isDepositOpen} closeModal={this.onDepositClose} />
        <Intro></Intro>
        <DepositWithdraw></DepositWithdraw>
        <DLCTable></DLCTable>
        <Footer></Footer>
      </>
    );
  }
}