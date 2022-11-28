import React from "react";
import eventBus from "../EventBus";
import { RepeatClockIcon } from "@chakra-ui/icons";
import {
  VStack,
  Text,
  HStack,
  Collapse,
  IconButton,
  SimpleGrid,
  ScaleFade,
} from "@chakra-ui/react";
import Card from "./Card";

export default class DLCTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: this.props.isConnected,
      bitCoinValue: 0,
      loans: [],
      isLoading: undefined,
      manualLoading: undefined
    };
  }

  async componentDidMount() {
    this.fetchBitcoinValue();
    this.setState({ address: this.props.address });
    this.refreshLoansTable(false);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.isConnected !== this.props.isConnected) {
      this.setState({ isConnected: this.props.isConnected });
    }
    eventBus.on('fetch-loans-bg', () => {
      this.refreshLoansTable(true);
    })
  }

  openDepositModal() {
    eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
  }

  refreshLoansTable(manual) {
    this.setState({ isLoading: true, manualLoading: manual });
    eventBus.dispatch("set-loading-state", { isLoading: true });
    this.fetchAllDLC()
      .then(
        (loans) => {
          this.setState({ loans: loans }); 
          this.countBalance(loans)
        }
      )
      .then(() => this.setState({ isLoading: false }))
      .then(() => eventBus.dispatch("set-loading-state", { isLoading: false }));
  }

  countBalance = (loans) => {
    let depositAmount = 0;
    let loanAmount = 0;
    for (const loan of loans) {
      if (loan.raw.status === "funded") {
        depositAmount += Number(loan.raw.vaultCollateral);
        loanAmount += Number(loan.raw.vaultLoan);
      }
    }
    eventBus.dispatch("change-deposit-amount", {
      depositAmount: depositAmount,
    });
    eventBus.dispatch("change-loan-amount", {
      loanAmount: loanAmount,
    });
  };

  fetchAllDLC = async () => {
    let dlcArray = undefined;
    await fetch("/.netlify/functions/get-dlc?creator=" + this.props.address, {
      headers: { accept: "Accept: application/json" },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        dlcArray = msg;
      });
    return dlcArray;
  };

  fetchBitcoinValue = async () => {
    await fetch("/.netlify/functions/get-bitcoin-price", {
      headers: { accept: "Accept: application/json" },
    })
      .then((x) => x.json())
      .then(({ msg }) => {
        this.setState({
          bitCoinValue: Number(msg.bpi.USD.rate.replace(/[^0-9.-]+/g, "")),
        });
      });
  };

  render() {
    return (
      <>
        <Collapse in={this.state.isConnected}>
          <VStack margin={25} alignContent="center" justifyContent="center">
            <HStack spacing={15}>
              <Text fontSize={[25, 50]} fontWeight="extrabold" color="white">
                Loans
              </Text>
              <IconButton
                _hover={{
                  background: "secondary1",
                }}
                isLoading={this.state.isLoading && this.state.manualLoading}
                variant="outline"
                onClick={() => this.refreshLoansTable(true)}
                color="white"
                borderRadius="full"
                width={[25, 35]}
                height={[25, 35]}
              >
                <RepeatClockIcon color="accent"></RepeatClockIcon>
              </IconButton>
            </HStack>
            <ScaleFade in={!this.state.isLoading}>
              <SimpleGrid
                columns={[1, 4]}
                spacing={[0, 15]}
              >
                {this.state.loans?.map((loan) => (
                  <Card
                    dlc={loan}
                    creator={this.props.address}
                    bitCoinValue={this.state.bitCoinValue}
                  ></Card>
                ))}
              </SimpleGrid>
            </ScaleFade>
          </VStack>
        </Collapse>
      </>
    );
  }
}
