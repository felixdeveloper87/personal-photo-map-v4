import { Box, VStack, Icon, Text, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';

const InfoBox = ({ icon, label, value, colorScheme = "blue", onClick, size = "default" }) => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');

  // Tamanhos responsivos baseados no breakpoint
  const isMobile = useBreakpointValue({ base: true, sm: false, md: false, lg: false, xl: false });

  // Tamanhos padronizados para garantir consistência
  const sizes = {
    default: {
      minW: isMobile ? "100px" : "140px",
      minH: isMobile ? "100px" : "140px",
      p: isMobile ? 2 : 4,
      borderRadius: isMobile ? "8px" : "12px",
      iconSize: isMobile ? 6 : 8,
      labelFontSize: isMobile ? "xs" : "sm",
      valueFontSize: isMobile ? "sm" : "md",
      spacing: isMobile ? 1 : 2
    },
    large: {
      minW: isMobile ? "80px" : "100px",
      minH: isMobile ? "120px" : "180px",
      p: isMobile ? 3 : 5,
      borderRadius: isMobile ? "10px" : "16px",
      iconSize: isMobile ? 5 : 6,
      labelFontSize: isMobile ? "sm" : "md",
      valueFontSize: isMobile ? "md" : "lg",
      spacing: isMobile ? 2 : 3
    },
    mobile: {
      minW: "80px",
      minH: "80px",
      p: 2,
      borderRadius: "8px",
      iconSize: 5,
      labelFontSize: "xs",
      valueFontSize: "sm",
      spacing: 1
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
