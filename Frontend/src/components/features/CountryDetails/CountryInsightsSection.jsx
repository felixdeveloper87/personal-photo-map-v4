import { Box, Card, CardBody, Text, Flex, VStack, HStack, Button, Icon, useDisclosure, useColorModeValue, Badge, Divider, Tooltip, useToast } from '@chakra-ui/react';
import { FaCloudUploadAlt, FaGlobe, FaMapMarkerAlt, FaShare } from 'react-icons/fa';
import ImageUploaderModal from '../../modals/ImageUploaderModal';

const CountryInsightsSection = ({ countryInfo, cardBg, borderColor, countryId, onUploadSuccess }) => {
  const { isOpen: isImageUploaderOpen, onOpen: onImageUploaderOpen, onClose: onImageUploaderClose } = useDisclosure();
  const toast = useToast();

  // Color mode values for subtle design
  const subtleBg = useColorModeValue('gray.50', 'gray.800');
  const subtleBorder = useColorModeValue('gray.200', 'gray.600');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  
  // Share functionality - In development
  const handleShare = () => {
    toast({
      title: "Feature in Development",
      description: "Share functionality is coming soon!",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
  };

  return (
    <Box mb={3}>
      <Card 
        bg={subtleBg} 
        border="1px solid" 
        borderColor={subtleBorder} 
        shadow="sm" 
        className="country-details-card card-entrance"
        borderRadius="lg"
        overflow="hidden"
      >
        <CardBody p={4}>
          <VStack spacing={3} align="stretch">
            
            {/* Header with country status */}
            <Flex justify="space-between" align="center">
              <HStack spacing={2}>
                <Icon as={FaGlobe} color={iconColor} boxSize={4} />
                <Text fontSize="sm" fontWeight="medium" color={textSecondary}>
                  Travel Hub
                </Text>
              </HStack>
              <Badge 
                colorScheme="blue" 
                variant="subtle" 
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                Explore
              </Badge>
            </Flex>

            <Divider />

            {/* Action buttons - centered and balanced */}
            <Flex justify="center" gap={4} flexWrap="wrap">
              
              {/* Upload Photos Button - Primary action */}
              <Tooltip label="Share your travel memories" hasArrow>
                <Button
                  onClick={onImageUploaderOpen}
                  leftIcon={<Icon as={FaCloudUploadAlt} boxSize={4} />}
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  color={useColorModeValue('blue.600', 'blue.200')}
                  _hover={{
                    bg: useColorModeValue('blue.100', 'blue.800'),
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="md"
                  fontWeight="medium"
                  minW="120px"
                  px={6}
                >
                  Add Photos
                </Button>
              </Tooltip>

              {/* Share Button - Secondary action */}
              <Tooltip label="Coming soon - Share functionality" hasArrow>
                <Button
                  onClick={handleShare}
                  leftIcon={<Icon as={FaShare} boxSize={4} />}
                  variant="ghost"
                  colorScheme="gray"
                  size="sm"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  color={useColorModeValue('gray.600', 'gray.300')}
                  _hover={{
                    bg: useColorModeValue('gray.200', 'gray.600'),
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  transition="all 0.2s ease"
                  borderRadius="md"
                  fontWeight="medium"
                  minW="120px"
                  px={6}
                >
                  Share
                </Button>
              </Tooltip>
            </Flex>

            {/* Quick insights - contextual information */}
            <Box>
              <Text fontSize="xs" color={textSecondary} textAlign="center" lineHeight="relaxed">
                <Icon as={FaMapMarkerAlt} mr={1} />
                Start building your travel story • Upload photos to remember this destination
              </Text>
            </Box>

          </VStack>
        </CardBody>
        
        <ImageUploaderModal
          countryId={countryId}
          onUploadSuccess={onUploadSuccess}
          isOpen={isImageUploaderOpen}
          onOpen={onImageUploaderOpen}
          onClose={onImageUploaderClose}
        />
      </Card>
    </Box>
  );
};

export default CountryInsightsSection;
