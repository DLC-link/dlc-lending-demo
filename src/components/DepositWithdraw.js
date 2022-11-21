import React from "react";
import eventBus from "../EventBus";
import {
  VStack,
  Button,
  Text,
  HStack,
  Flex,
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Collapse,
} from "@chakra-ui/react";

export default class DepositWithdraw extends React.Component {
  constructor() {
    super();
    this.state = {
      isConnected: false,
      bitCoin: 0,
    };
  }

  componentDidMount() {
    this.setState({ isConnected: this.props.isConnected });
    eventBus.on("change-deposit", (data) =>
      this.setState({
        bitCoin: Number(this.state.bitCoin) + Number(data.deposit),
      })
    );
    console.log(this.state);
  }

  openDepositModal() {
    eventBus.dispatch("is-deposit-modal-open", { isDepositOpen: true });
  }

  render() {
    return (
      <>
        <Collapse in={this.state.isConnected}>
          <Flex
            margin={25}
            alignContent="center"
            justifyContent="center"
            padding={25}
          >
            <VStack>
              <Text fontSize={[25, 50]} fontWeight="extrabold" color="white">
                Balance
              </Text>
              <Flex
                bgGradient="linear(to-d, secondary1, secondary2)"
                borderRadius="lg"
                alignContent="center"
                justifyContent="center"
                width={[250, "full"]}
                padding="10px 10px"
                boxShadow="dark-lg"
              >
                <VStack>
                  <TableContainer>
                    <Table variant="simple" color="white">
                      <TableCaption>Deposit or withdraw Bitcoin</TableCaption>
                      <Thead>
                        <Tr>
                          <Th color="white">Asset</Th>
                          <Th color="white">Balance</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>
                            <Image
                              src="/btc_logo.png"
                              alt="Bitcoin Logo"
                              width={25}
                              height={25}
                              borderRadius="3px"
                            ></Image>
                          </Td>
                          <Td>{this.state.bitCoin}</Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <HStack spacing={25}>
                    <Button
                      _hover={{
                        color: "white",
                        bg: "secondary1",
                      }}
                      color="accent"
                      width={100}
                      shadow="lg"
                      variant="outline"
                      fontSize="sm"
                      fontWeight="bold"
                      onClick={this.openDepositModal}
                    >
                      DEPOSIT
                    </Button>
                    <Button
                      _hover={{
                        color: "white",
                        bg: "secondary1",
                      }}
                      color="accent"
                      width={100}
                      shadow="lg"
                      variant="outline"
                      fontSize="sm"
                      fontWeight="bold"
                      isDisabled
                    >
                      WITHDRAW
                    </Button>
                  </HStack>
                </VStack>
              </Flex>
            </VStack>
          </Flex>
        </Collapse>
      </>
    );
  }
}
