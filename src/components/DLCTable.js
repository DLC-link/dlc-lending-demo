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
import { customShiftValue, fixedTwoDecimalShift, hex2ascii } from "../utils";
import Card from "./Card";
import { cvToHex, addressToString, bufferCV } from "@stacks/transactions";
import { bytesToUtf8 } from "micro-stacks/common";

export default class DLCTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isConnected: this.props.isConnected,
      bitCoinValue: 0,
      loans: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    this.fetchBitcoinValue();
    this.setState({ address: this.props.address });
    this.setLoans()
      .then((dlcs) => this.setState({ loans: dlcs }))
      .then(() => this.setState({ isLoading: false }))
      .then(() => eventBus.dispatch("setLoadingState", false));
  }

  componentDidUpdate(previousProps) {
    if (previousProps.isConnected !== this.props.isConnected) {
      this.setState({ isConnected: this.props.isConnected });
    }
    console.log(this.state);
  }

  openDepositModal() {
    eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
  }

  refreshDLCTable() {
    this.setState({ isLoading: true });
    eventBus.dispatch("setLoadingState", false);
    this.setLoans()
      .then((formattedDLCArray) =>
        this.setState({ formattedDLCArray: formattedDLCArray })
      )
      .then(() => this.setState({ isLoading: false }))
      .then(() => eventBus.dispatch("setLoadingState", false));
  }

  setLoans = async () => {
    const dlcs = await this.fetchAllDLC();
    return dlcs;
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
                isLoading={this.state.isLoading}
                variant="outline"
                onClick={() => this.refreshDLCTable()}
                color="white"
                borderRadius="full"
                width={[25, 35]}
                height={[25, 35]}
              >
                <RepeatClockIcon color="accent"></RepeatClockIcon>
              </IconButton>
            </HStack>
            <SimpleGrid columns={[1, 4]} spacing={[0, 15]}>
              {this.state.formattedDLCArray?.map((dlc) => (
                <ScaleFade in={!this.state.isLoading} key={dlc.dlcUUID}>
                  <Card
                    creator={this.props.address}
                    bitCoinValue={this.state.bitCoinValue}
                    status={dlc.status}
                    dlcUUID={dlc.dlcUUID}
                    owner={dlc.owner}
                    vaultCollateral={dlc.vaultCollateral}
                    vaultLoan={dlc.vaultLoan}
                    liquidationFee={dlc.liquidationFee}
                    liquidationRatio={dlc.liquidationRatio}
                    closingPrice={dlc.closingPrice}
                  ></Card>
                </ScaleFade>
              ))}
            </SimpleGrid>
          </VStack>
        </Collapse>
      </>
    );
  }
}
