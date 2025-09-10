import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  Badge,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { CountriesContext } from '../../context/CountriesContext';
import { AuthContext } from '../../context/AuthContext';

const UserStatisticsModal = ({ isOpen, onClose }) => {
  const { countriesWithPhotos, photoCount, countryCount } = React.useContext(CountriesContext);
  const { isPremium } = React.useContext(AuthContext);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg={bgColor} borderRadius="xl" boxShadow="2xl">
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">
              Your Travel Statistics
            </Text>
            {isPremium && (
              <Badge colorScheme="purple" variant="solid" borderRadius="full" px={3} py={1}>
                Premium
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Main Statistics Grid */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Stat
                  p={4}
                  bg={statBg}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <StatLabel color={textColor}>Photos Uploaded</StatLabel>
                  <StatNumber fontSize="2xl" color="blue.500">
                    {photoCount || 0}
                  </StatNumber>
                  <StatHelpText>Total photos in your collection</StatHelpText>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat
                  p={4}
                  bg={statBg}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <StatLabel color={textColor}>Countries Visited</StatLabel>
                  <StatNumber fontSize="2xl" color="green.500">
                    {countryCount || 0}
                  </StatNumber>
                  <StatHelpText>Countries with photos</StatHelpText>
                </Stat>
              </GridItem>
            </Grid>

            <Divider />

            {/* Countries List */}
            {countriesWithPhotos && countriesWithPhotos.length > 0 ? (
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={3} color={textColor}>
                  Countries with Photos
                </Text>
                <VStack spacing={2} align="stretch" maxH="300px" overflowY="auto">
                  {countriesWithPhotos.map((country, index) => (
                    <HStack
                      key={index}
                      justify="space-between"
                      p={3}
                      bg={statBg}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Text fontWeight="medium">{country.name}</Text>
                      <Badge colorScheme="blue" variant="subtle">
                        {country.photoCount} photo{country.photoCount !== 1 ? 's' : ''}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ) : (
              <Box textAlign="center" py={8}>
                <Text color={textColor} fontSize="lg">
                  No photos uploaded yet
                </Text>
                <Text color={textColor} fontSize="sm" mt={2}>
                  Start your journey by uploading photos from your travels!
                </Text>
              </Box>
            )}

            {/* Premium Features Info */}
            {!isPremium && (
              <Box
                p={4}
                bg="purple.50"
                borderRadius="lg"
                border="1px solid"
                borderColor="purple.200"
              >
                <Text fontSize="sm" color="purple.700" textAlign="center">
                  Upgrade to Premium to unlock advanced statistics, detailed analytics, and more!
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UserStatisticsModal;
