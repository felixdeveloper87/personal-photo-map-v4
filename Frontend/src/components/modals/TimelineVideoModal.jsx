import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  useColorModeValue,
  Badge,
  SimpleGrid,
  Image,
  Box,
} from '@chakra-ui/react';
import { FaVideo, FaImages, FaCalendar } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { buildApiUrl } from '../../utils/apiConfig';
import TimelineVideoGenerator from '../features/TimelineVideoGeneratorRefactored';

// Fetch photos for video generation
const fetchAllPictures = async () => {
  const response = await fetch(buildApiUrl('/api/images/allPictures'), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch photos: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((image) => ({
    url: image.filePath.includes('s3.') ? image.filePath : `${import.meta.env.VITE_BACKEND_URL}${image.filePath}`,
    id: image.id,
    year: image.year,
    countryId: image.countryId,
    fileName: image.fileName,
  }));
};

const TimelineVideoModal = ({ isOpen, onClose }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [showGenerator, setShowGenerator] = useState(false);

  // Cores do tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  // Fetch photos
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['allPicturesForVideo'],
    queryFn: fetchAllPictures,
    enabled: isLoggedIn && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Agrupar imagens por ano para estatísticas
  const imagesByYear = images.reduce((acc, img) => {
    if (!acc[img.year]) acc[img.year] = [];
    acc[img.year].push(img);
    return acc;
  }, {});

  const years = Object.keys(imagesByYear).sort((a, b) => Number(a) - Number(b));
  const totalPhotos = images.length;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowGenerator(false);
    }
  }, [isOpen]);

  if (!isLoggedIn) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Timeline Video Generator</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="warning">
              <AlertIcon />
              <AlertDescription>
                You need to be logged in to generate timeline videos.
              </AlertDescription>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: "full", md: "6xl" }} 
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent 
        maxH={{ base: "100vh", md: "90vh" }}
        h={{ base: "100vh", md: "auto" }}
        mx={{ base: 0, md: 4 }}
        my={{ base: 0, md: 4 }}
        borderRadius={{ base: 0, md: "lg" }}
        display="flex"
        flexDirection="column"
      >
        <ModalHeader>
          <HStack>
            <FaVideo />
            <Text>Timeline Video Generator</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody 
          pb={{ base: 4, md: 6 }}
          px={{ base: 4, md: 6 }}
          pt={{ base: 4, md: 6 }}
          flex="1"
          overflowY="auto"
          display="flex"
          flexDirection="column"
        >
          {isLoading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="blue.500" />
              <Text>Loading your photos...</Text>
            </VStack>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Error loading photos: {error.message}
              </AlertDescription>
            </Alert>
          ) : totalPhotos === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>
                You don't have photos in your timeline yet. Upload some photos first to generate a video.
              </AlertDescription>
            </Alert>
          ) : showGenerator ? (
            <TimelineVideoGenerator 
              images={images} 
              onClose={() => setShowGenerator(false)} 
            />
          ) : (
            <VStack spacing={6} align="stretch" flex="1">
              {/* Estatísticas */}
              <Box p={4} bg={bgColor} borderRadius="lg" border={`1px solid ${borderColor}`}>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Your Timeline Summary
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={{ base: 3, md: 4 }} w="100%">
                    <VStack p={4} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("blue.200", "blue.600")}>
                      <FaImages size={24} color={useColorModeValue("#3182CE", "#63B3ED")} />
                      <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("blue.600", "blue.300")}>
                        {totalPhotos}
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("blue.600", "blue.300")}>
                        Total Photos
                      </Text>
                    </VStack>

                    <VStack p={4} bg={useColorModeValue("green.50", "green.900")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("green.200", "green.600")}>
                      <FaCalendar size={24} color={useColorModeValue("#38A169", "#68D391")} />
                      <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("green.600", "green.300")}>
                        {years.length}
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("green.600", "green.300")}>
                        Different Years
                      </Text>
                    </VStack>

                    <VStack p={4} bg={useColorModeValue("purple.50", "purple.900")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("purple.200", "purple.600")}>
                      <FaVideo size={24} color={useColorModeValue("#805AD5", "#B794F6")} />
                      <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("purple.600", "purple.300")}>
                        {Math.round((totalPhotos * 1.5) / 60)}min
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("purple.600", "purple.300")}>
                        Estimated Duration
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Box>

              {/* Anos com fotos */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color={textColor}>
                  Years available in your timeline:
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {years.map(year => (
                    <Badge
                      key={year}
                      colorScheme="blue"
                      variant="solid"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      {year} ({imagesByYear[year].length} photos)
                    </Badge>
                  ))}
                </HStack>
              </Box>

              {/* Preview de algumas fotos */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color={textColor}>
                  Preview of your photos:
                </Text>
                <SimpleGrid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} spacing={{ base: 2, md: 2 }}>
                  {images.slice(0, 8).map((img, index) => (
                    <Box key={img.id} position="relative">
                      <Image
                        src={img.url}
                        alt={`Photo ${index + 1}`}
                        w={{ base: "50px", md: "60px" }}
                        h={{ base: "50px", md: "60px" }}
                        objectFit="cover"
                        borderRadius="md"
                        border="2px solid"
                        borderColor={borderColor}
                      />
                      <Badge
                        position="absolute"
                        top="-1"
                        right="-1"
                        size="xs"
                        colorScheme="blue"
                        borderRadius="full"
                      >
                        {img.year}
                      </Badge>
                    </Box>
                  ))}
                  {totalPhotos > 8 && (
                    <VStack
                      w={{ base: "50px", md: "60px" }}
                      h={{ base: "50px", md: "60px" }}
                      justify="center"
                      bg={useColorModeValue("gray.100", "gray.700")}
                      borderRadius="md"
                      border="2px dashed"
                      borderColor={borderColor}
                    >
                      <Text fontSize="xs" color={mutedTextColor}>
                        +{totalPhotos - 8}
                      </Text>
                    </VStack>
                  )}
                </SimpleGrid>
              </Box>

              {/* Informações sobre o gerador */}
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  <strong>100% Free and Private:</strong> The video will be generated entirely in your browser
                  using modern web technologies. No photos will be sent to external servers.
                  The process uses HTML5 Canvas and Media Recording API.
                </AlertDescription>
              </Alert>

              {/* Funcionalidades */}
              <Box p={4} bg={cardBg} borderRadius="lg" border={`1px solid ${borderColor}`}>
                <Text fontSize="md" fontWeight="semibold" mb={2} color={textColor}>
                  Generator Features:
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedTextColor}>• Automatic transitions between photos (fade, slide, zoom)</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Chronological organization by year</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Multiple resolutions including Stories/Reels format</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Text overlay with year and counter</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Background music support (upload or presets)</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• 📱 Automatic MP4 conversion for iPhone compatibility</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Direct download of final video</Text>
                </VStack>
              </Box>
            </VStack>
          )}
        </ModalBody>
        
        {/* Footer fixo com botão sempre visível */}
        {!showGenerator && !isLoading && totalPhotos > 0 && (
          <ModalFooter
            borderTop={`1px solid ${borderColor}`}
            bg={bgColor}
            position={{ base: "sticky", md: "static" }}
            bottom={0}
            zIndex={10}
            justifyContent="center"
          >
            <Button
              leftIcon={<FaVideo />}
              colorScheme="blue"
              size={{ base: "md", md: "lg" }}
              onClick={() => setShowGenerator(true)}
              px={{ base: 6, md: 8 }}
              w={{ base: "90%", sm: "auto" }}
              minW="250px"
            >
              Start Generating Video
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TimelineVideoModal;