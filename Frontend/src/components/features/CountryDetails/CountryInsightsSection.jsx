import { Box, Card, CardBody, Text, Flex, VStack, HStack, Link, Button, Icon, useDisclosure } from '@chakra-ui/react';
import { FaPlaneDeparture, FaCloudUploadAlt } from 'react-icons/fa';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import ImageUploaderModal from '../../modals/ImageUploaderModal';

const CountryInsightsSection = ({ countryInfo, cardBg, borderColor, countryId, onUploadSuccess }) => {
  const { isOpen: isImageUploaderOpen, onOpen: onImageUploaderOpen, onClose: onImageUploaderClose } = useDisclosure();

  return (
    <Box mb={4}>
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} shadow="lg" className="country-details-card card-entrance">
        <CardBody>
          <VStack spacing={6} align="stretch">
            {/*Upload Buttons */}
            <Flex justify="center" gap={4} flexWrap="wrap">

            {/* Upload Photos Button */}
            <Button
              onClick={onImageUploaderOpen}
              leftIcon={<Icon as={FaCloudUploadAlt} />}
              bgGradient="linear(135deg, #4ade80 0%, #22c55e 100%)"
              color="white"
              _hover={{
                bgGradient: "linear(135deg, #22c55e 0%, #16a34a 100%)",
                transform: "translateY(-2px)",
                boxShadow: "lg"
              }}
              _active={{
                transform: "translateY(0)"
              }}
              transition="all 0.3s ease"
              borderRadius="xl"
              fontWeight="bold"
              size="md"
            >
              Upload Photos
            </Button>
          </Flex>
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
