import { Box, VStack, Icon, Text, useColorModeValue } from '@chakra-ui/react';

const InfoBox = ({ icon, label, value, colorScheme = "blue", onClick, size = "default" }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');

  // Tamanhos padronizados para garantir consistência
  const sizes = {
    default: {
      minW: "140px",
      minH: "140px",
      p: 4,
      borderRadius: "12px",
      iconSize: 8,
      labelFontSize: "sm",
      valueFontSize: "md",
      spacing: 2
    },
    large: {
      minW: "100px",
      minH: "180px",
      p: 5,
      borderRadius: "16px",
      iconSize: 6,
      labelFontSize: "md",
      valueFontSize: "lg",
      spacing: 3
    }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <Box
      minW={currentSize.minW}
      minH={currentSize.minH}
      textAlign="center"
      p={currentSize.p}
      bg={bgColor}
      borderRadius={currentSize.borderRadius}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
      transition="all 0.3s ease"
      border="1px solid"
      borderColor={borderColor}
      m={1}
      cursor={onClick ? 'pointer' : 'default'}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      _hover={{
        transform: onClick ? "translateY(-2px) scale(1.01)" : "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)"
      }}
      _active={onClick ? { transform: "translateY(0) scale(0.99)" } : undefined}
    >
      <VStack spacing={currentSize.spacing} align="center" justify="center" h="full">
        <Icon as={icon} boxSize={currentSize.iconSize} color={`${colorScheme}.500`} />
        <Text fontSize={currentSize.labelFontSize} color={labelColor} textTransform="uppercase" fontWeight="bold" letterSpacing="wide">
          {label}
        </Text>
        <Text fontSize={currentSize.valueFontSize} fontWeight="semibold" color={textColor} noOfLines={2} textAlign="center">
          {value || 'N/A'}
        </Text>
      </VStack>
    </Box>
  );
};

export default InfoBox;
