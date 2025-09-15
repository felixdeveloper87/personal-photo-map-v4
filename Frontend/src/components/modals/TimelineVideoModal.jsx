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
import { MdClose, MdUndo } from 'react-icons/md';
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
  const [excludedImageIds, setExcludedImageIds] = useState(new Set());

  // Cores do tema - Estilo OpenAI
  const bgColor = useColorModeValue('white', '#0f0f0f');
  const modalBg = useColorModeValue('white', '#171717');
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)');
  const textColor = useColorModeValue('#1a1a1a', '#f0f0f0');
  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const cardBg = useColorModeValue('#f8f9fa', '#262626');
  const mutedTextColor = useColorModeValue('#666666', '#a0a0a0');
  const headerBg = useColorModeValue('white', '#1a1a1a');
  const buttonBg = useColorModeValue('#000000', '#ffffff');
  const buttonText = useColorModeValue('#ffffff', '#000000');
  const secondaryButtonBg = useColorModeValue('transparent', 'transparent');
  const secondaryButtonBorder = useColorModeValue('#d0d0d0', '#404040');
  const secondaryButtonText = useColorModeValue('#1a1a1a', '#f0f0f0');

  // Fetch photos
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['allPicturesForVideo'],
    queryFn: fetchAllPictures,
    enabled: isLoggedIn && isOpen,
    staleTime: 5 * 60 * 1000,
  });

  // Filtrar imagens excluídas
  const filteredImages = images.filter(img => !excludedImageIds.has(img.id));
  
  // Agrupar imagens por ano para estatísticas
  const imagesByYear = filteredImages.reduce((acc, img) => {
    if (!acc[img.year]) acc[img.year] = [];
    acc[img.year].push(img);
    return acc;
  }, {});

  const years = Object.keys(imagesByYear).sort((a, b) => Number(a) - Number(b));
  const totalPhotos = filteredImages.length;
  const excludedCount = excludedImageIds.size;

  // Funções para gerenciar remoção de fotos
  const removeImage = (imageId) => {
    setExcludedImageIds(prev => new Set([...prev, imageId]));
  };

  const restoreImage = (imageId) => {
    setExcludedImageIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
  };

  const restoreAllImages = () => {
    setExcludedImageIds(new Set());
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowGenerator(false);
      setExcludedImageIds(new Set());
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
      <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
      <ModalContent 
        maxH={{ base: "100vh", md: "90vh" }}
        h={{ base: "100vh", md: "auto" }}
        mx={{ base: 0, md: 4 }}
        my={{ base: 0, md: 4 }}
        borderRadius={{ base: 0, md: "xl" }}
        display="flex"
        flexDirection="column"
        bg={modalBg}
        border={`1px solid ${borderColor}`}
        boxShadow={useColorModeValue(
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
        )}
      >
        <ModalHeader 
          bg={headerBg} 
          borderBottom={`1px solid ${borderColor}`}
          py={6}
          px={8}
          borderTopRadius={{ base: 0, md: "xl" }}
        >
          <HStack spacing={3}>
            <Box 
              p={2} 
              borderRadius="md" 
              bg={useColorModeValue("gray.100", "gray.800")}
            >
              <FaVideo color={useColorModeValue("#4a5568", "#e2e8f0")} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold" color={textColor}>
              Timeline Video Generator
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton 
          color={textColor}
          _hover={{ bg: useColorModeValue("gray.100", "gray.800") }}
          borderRadius="lg"
          size="lg"
        />
        <ModalBody 
          pb={{ base: 4, md: 6 }}
          px={{ base: 6, md: 8 }}
          pt={{ base: 6, md: 8 }}
          flex="1"
          overflowY="auto"
          display="flex"
          flexDirection="column"
          bg={modalBg}
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
              images={filteredImages} 
              onClose={() => setShowGenerator(false)} 
            />
          ) : (
            <VStack spacing={6} align="stretch" flex="1">
              {/* Estatísticas */}
              <Box>
                <Text fontSize="lg" fontWeight="medium" color={textColor} mb={4}>
                  Timeline Summary
                </Text>
                
                <HStack spacing={{ base: 4, md: 6 }} justify="space-between" w="100%">
                  <VStack 
                    spacing={1} 
                    align="center"
                    flex="1"
                    p={3}
                    bg={useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")}
                    borderRadius="lg"
                    border={`1px solid ${borderColor}`}
                    transition="all 0.2s"
                    _hover={{
                      bg: useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)"),
                      transform: "translateY(-1px)"
                    }}
                  >
                    <Box mb={1}>
                      <FaImages size={16} color={useColorModeValue("#6B7280", "#9CA3AF")} />
                    </Box>
                    <Text fontSize="xl" fontWeight="semibold" color={textColor} lineHeight="1">
                      {totalPhotos}
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor} textAlign="center" lineHeight="1.2">
                      Photos
                    </Text>
                  </VStack>

                  <VStack 
                    spacing={1} 
                    align="center"
                    flex="1"
                    p={3}
                    bg={useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")}
                    borderRadius="lg"
                    border={`1px solid ${borderColor}`}
                    transition="all 0.2s"
                    _hover={{
                      bg: useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)"),
                      transform: "translateY(-1px)"
                    }}
                  >
                    <Box mb={1}>
                      <FaCalendar size={16} color={useColorModeValue("#6B7280", "#9CA3AF")} />
                    </Box>
                    <Text fontSize="xl" fontWeight="semibold" color={textColor} lineHeight="1">
                      {years.length}
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor} textAlign="center" lineHeight="1.2">
                      Years
                    </Text>
                  </VStack>

                  <VStack 
                    spacing={1} 
                    align="center"
                    flex="1"
                    p={3}
                    bg={useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")}
                    borderRadius="lg"
                    border={`1px solid ${borderColor}`}
                    transition="all 0.2s"
                    _hover={{
                      bg: useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.04)"),
                      transform: "translateY(-1px)"
                    }}
                  >
                    <Box mb={1}>
                      <FaVideo size={16} color={useColorModeValue("#6B7280", "#9CA3AF")} />
                    </Box>
                    <Text fontSize="xl" fontWeight="semibold" color={textColor} lineHeight="1">
                      {Math.round((totalPhotos * 1.5) / 60)}min
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor} textAlign="center" lineHeight="1.2">
                      Duration
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Anos com fotos */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3} color={textColor}>
                  Available Years
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {years.map(year => (
                    <Box
                      key={year}
                      px={3}
                      py={1.5}
                      bg={useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.06)")}
                      borderRadius="md"
                      border={`1px solid ${borderColor}`}
                      fontSize="sm"
                      color={textColor}
                      fontWeight="medium"
                      transition="all 0.2s"
                      _hover={{
                        bg: useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.12)"),
                        transform: "translateY(-1px)"
                      }}
                    >
                      {year} ({imagesByYear[year].length})
                    </Box>
                  ))}
                </HStack>
              </Box>

              {/* Preview de algumas fotos */}
              <Box>
                <HStack justify="space-between" align="center" mb={4}>
                  <Text fontSize="md" fontWeight="medium" color={textColor}>
                    Photo Preview
                  </Text>
                  {excludedCount > 0 && (
                    <Button
                      size="sm"
                      leftIcon={<MdUndo />}
                      variant="ghost"
                      onClick={restoreAllImages}
                      borderRadius="lg"
                      color={useColorModeValue("#F59E0B", "#FBBF24")}
                      fontSize="xs"
                      _hover={{
                        bg: useColorModeValue("rgba(245, 158, 11, 0.1)", "rgba(251, 191, 36, 0.1)")
                      }}
                    >
                      Restore {excludedCount}
                    </Button>
                  )}
                </HStack>
                
                <SimpleGrid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} spacing={{ base: 2, md: 3 }}>
                  {images.map((img, index) => {
                    const isExcluded = excludedImageIds.has(img.id);
                    return (
                      <Box 
                        key={img.id} 
                        position="relative"
                        opacity={isExcluded ? 0.4 : 1}
                        transform={isExcluded ? "scale(0.95)" : "scale(1)"}
                        transition="all 0.2s"
                      >
                        <Image
                          src={img.url}
                          alt={`Photo ${index + 1}`}
                          w={{ base: "50px", md: "60px" }}
                          h={{ base: "50px", md: "60px" }}
                          objectFit="cover"
                          borderRadius="lg"
                          border="2px solid"
                          borderColor={isExcluded ? "red.300" : borderColor}
                          filter={isExcluded ? "grayscale(100%)" : "none"}
                        />
                        
                        {/* Botão de remoção/restauração */}
                        <Box
                          position="absolute"
                          top="-1"
                          left="-1"
                          onClick={() => isExcluded ? restoreImage(img.id) : removeImage(img.id)}
                          cursor="pointer"
                          bg={isExcluded ? "orange.500" : "red.500"}
                          borderRadius="full"
                          w="20px"
                          h="20px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          _hover={{ 
                            transform: "scale(1.1)",
                            bg: isExcluded ? "orange.600" : "red.600"
                          }}
                          transition="all 0.2s"
                          boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                        >
                          {isExcluded ? (
                            <MdUndo size={12} color="white" />
                          ) : (
                            <MdClose size={12} color="white" />
                          )}
                        </Box>

                        {/* Badge do ano */}
                        <Badge
                          position="absolute"
                          bottom="-1"
                          right="-1"
                          size="xs"
                          colorScheme={isExcluded ? "gray" : "blue"}
                          borderRadius="full"
                          opacity={isExcluded ? 0.6 : 1}
                        >
                          {img.year}
                        </Badge>
                      </Box>
                    );
                  })}
                </SimpleGrid>
                
                {excludedCount > 0 && (
                  <Text fontSize="sm" color="orange.500" mt={3} textAlign="center">
                    {excludedCount} photo{excludedCount > 1 ? 's' : ''} removed from video
                  </Text>
                )}
              </Box>

              {/* Informações sobre o gerador */}
              <Box 
                p={4} 
                bg={useColorModeValue("rgba(59, 130, 246, 0.05)", "rgba(59, 130, 246, 0.1)")}
                borderRadius="lg" 
                border={`1px solid ${useColorModeValue("rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.3)")}`}
              >
                <HStack spacing={3} align="start">
                  <Box mt={0.5}>
                    <Box w={2} h={2} borderRadius="full" bg={useColorModeValue("#3B82F6", "#60A5FA")} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                      100% Private & Secure
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor} lineHeight="1.4">
                      Video generation happens entirely in your browser. No photos are uploaded to external servers.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Funcionalidades */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3} color={textColor}>
                  Features
                </Text>
                <VStack spacing={2} align="stretch">
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Automatic transitions and effects</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Chronological organization by year</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Multiple resolutions (HD, Stories, Reels)</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Background music support</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>📱 iPhone compatible MP4 export</Text>
                  </HStack>
                </VStack>
                
                {/* iPhone Instructions */}
                <Box 
                  mt={4} 
                  p={3} 
                  bg={useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")}
                  borderRadius="md"
                  border={`1px solid ${borderColor}`}
                >
                  <Text fontSize="xs" color={mutedTextColor} lineHeight="1.4">
                    <strong>📱 iPhone:</strong> Videos download to Files app. To save to Photos: open video → share → "Save to Photos"
                  </Text>
                </Box>
              </Box>
            </VStack>
          )}
        </ModalBody>
        
        {/* Footer fixo com botão sempre visível */}
        {!showGenerator && !isLoading && totalPhotos > 0 && (
          <ModalFooter
            borderTop={`1px solid ${borderColor}`}
            bg={headerBg}
            position={{ base: "sticky", md: "static" }}
            bottom={0}
            zIndex={10}
            justifyContent="center"
            py={6}
            px={8}
            borderBottomRadius={{ base: 0, md: "xl" }}
          >
            <Button
              leftIcon={<FaVideo />}
              bg={buttonBg}
              color={buttonText}
              size={{ base: "lg", md: "lg" }}
              onClick={() => setShowGenerator(true)}
              px={{ base: 8, md: 10 }}
              py={6}
              w={{ base: "90%", sm: "auto" }}
              minW="280px"
              borderRadius="xl"
              fontSize="md"
              fontWeight="semibold"
              _hover={{ 
                transform: "translateY(-1px)",
                boxShadow: useColorModeValue(
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  "0 10px 15px -3px rgba(0, 0, 0, 0.4)"
                )
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
              border={`1px solid ${useColorModeValue("transparent", "#404040")}`}
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