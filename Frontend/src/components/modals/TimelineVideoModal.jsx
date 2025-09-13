import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
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
import TimelineVideoGenerator from '../features/TimelineVideoGenerator';

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
          <ModalHeader>Gerador de Vídeo Timeline</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="warning">
              <AlertIcon />
              <AlertDescription>
                Você precisa estar logado para gerar vídeos do timeline.
              </AlertDescription>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <FaVideo />
            <Text>Timeline Video Generator</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
            <VStack spacing={6} align="stretch">
              {/* Estatísticas */}
              <Box p={4} bg={bgColor} borderRadius="lg" border={`1px solid ${borderColor}`}>
                <VStack spacing={4}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Resumo do seu Timeline
                  </Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="100%">
                    <VStack p={4} bg={useColorModeValue("blue.50", "blue.900")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("blue.200", "blue.600")}>
                      <FaImages size={24} color={useColorModeValue("#3182CE", "#63B3ED")} />
                      <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("blue.600", "blue.300")}>
                        {totalPhotos}
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("blue.600", "blue.300")}>
                        Total de Fotos
                      </Text>
                    </VStack>

                    <VStack p={4} bg={useColorModeValue("green.50", "green.900")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("green.200", "green.600")}>
                      <FaCalendar size={24} color={useColorModeValue("#38A169", "#68D391")} />
                      <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("green.600", "green.300")}>
                        {years.length}
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("green.600", "green.300")}>
                        Anos Diferentes
                      </Text>
                    </VStack>

                    <VStack p={4} bg={useColorModeValue("purple.50", "purple.900")} borderRadius="md" border="1px solid" borderColor={useColorModeValue("purple.200", "purple.600")}>
                      <FaVideo size={24} color={useColorModeValue("#805AD5", "#B794F6")} />
                      <Text fontSize="2xl" fontWeight="bold" color={useColorModeValue("purple.600", "purple.300")}>
                        {Math.round((totalPhotos * 1.5) / 60)}min
                      </Text>
                      <Text fontSize="sm" color={useColorModeValue("purple.600", "purple.300")}>
                        Duração Estimada
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </VStack>
              </Box>

              {/* Anos com fotos */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color={textColor}>
                  Anos disponíveis no seu timeline:
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
                      {year} ({imagesByYear[year].length} fotos)
                    </Badge>
                  ))}
                </HStack>
              </Box>

              {/* Preview de algumas fotos */}
              <Box>
                <Text fontSize="md" fontWeight="semibold" mb={3} color={textColor}>
                  Preview das suas fotos:
                </Text>
                <SimpleGrid columns={{ base: 4, md: 8 }} spacing={2}>
                  {images.slice(0, 8).map((img, index) => (
                    <Box key={img.id} position="relative">
                      <Image
                        src={img.url}
                        alt={`Foto ${index + 1}`}
                        w="60px"
                        h="60px"
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
                      w="60px"
                      h="60px"
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
                  <strong>100% Gratuito e Privado:</strong> O vídeo será gerado inteiramente no seu navegador
                  usando tecnologias web modernas. Nenhuma foto será enviada para servidores externos.
                  O processo usa HTML5 Canvas e Media Recording API.
                </AlertDescription>
              </Alert>

              {/* Funcionalidades */}
              <Box p={4} bg={cardBg} borderRadius="lg" border={`1px solid ${borderColor}`}>
                <Text fontSize="md" fontWeight="semibold" mb={2} color={textColor}>
                  Funcionalidades do Gerador:
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color={mutedTextColor}>• Transições automáticas entre fotos (fade, slide, zoom)</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Organização cronológica por ano</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Múltiplas resoluções (720p, 1080p, 1440p)</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Texto overlay com ano e contador</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Configurações personalizáveis</Text>
                  <Text fontSize="sm" color={mutedTextColor}>• Download direto do vídeo final</Text>
                </VStack>
              </Box>

              {/* Botão para iniciar */}
              <HStack justify="center" pt={4}>
                <Button
                  leftIcon={<FaVideo />}
                  colorScheme="blue"
                  size="lg"
                  onClick={() => setShowGenerator(true)}
                  px={8}
                >
                  Começar a Gerar Vídeo
                </Button>
              </HStack>
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TimelineVideoModal;
