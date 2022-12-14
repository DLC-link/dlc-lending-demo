import { Link, Flex, HStack, Text, Box } from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

export default function CustomToast(props) {
  const [explorerAddress, setExplorerAddress] = useState(props.explorerAddress)
  const [message, setMessage] = useState(props.message)
  const [success, setSuccess] = useState(props.success)

  useEffect(() => {
    setExplorerAddress(props.explorerAddress)
    setMessage(props.message)
    setSuccess(props.success)
  }, [props])

  console.log(explorerAddress + ' ' + message + ' ' + success)
  return (
    <Link
      href={explorerAddress}
      isExternal
      _hover={{
        textDecoration: "none",
      }}
    >
      <Box 
      marginTop={150}
      paddingRight={15}>
        <Flex
          color="white"
          bgColor="rgba(4, 186, 178, 0.8)"
          borderRadius="sm"
          boxShadow="dark-lg"
          height={45}
          width={350}
          justifyContent="center"
          alignItems="center"
          _hover={{
            opacity: "100%",
            bg: "accent",
          }}
        >
            <HStack spacing={3.5}>
              {success === true ? (
                <CheckCircleIcon color="green"></CheckCircleIcon>
              ) : (
                <WarningIcon color="red"></WarningIcon>
              )}
              <Text fontSize={12} fontWeight="extrabold">
                {message}
              </Text>
              {success && (
              <Text fontSize={8} fontWeight="bold">
                Click to show transaction in the explorer!
              </Text>
            )}
            </HStack>
        </Flex>
      </Box>
    </Link>
  );
}
