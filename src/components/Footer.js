import React from "react";
import {
    HStack,
    Flex
} from "@chakra-ui/react";

export default class Header extends React.Component {

    constructor() {
        super();
        this.state = {

        };
    }

    render() {
        return (
            <>
                <Flex height="500px" width="full" bgGradient="linear(to-r, background1, background2)" alignItems="flex-end" justifyContent="space-between">
                    <Flex alignItems="flex-end">
                        <HStack spacing="15px">
                        </HStack>
                    </Flex>
                </Flex>
            </>
        );
    }
}