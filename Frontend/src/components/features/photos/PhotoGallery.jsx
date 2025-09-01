import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Image,
  useDisclosure,
  Flex,
  Text,
  Button,
  VStack,
  useColorModeValue,
  SimpleGrid,
  Badge,
  HStack,
  IconButton,
  Checkbox,
  useBreakpointValue,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { DeleteButton } from '../../ui/buttons/CustomButtons';
import FullImageModal from '../../modals/FullImageModal';
import { motion, AnimatePresence } from 'framer-motion';

// Register country names
countries.registerLocale(en);

// Apple Photos style animation variants
const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  selected: {
    scale: 1,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

const PhotoGallery = memo(function PhotoGallery({
  images,
  onDeleteSelectedImages,
  selectedImageIds = [],
  setSelectedImageIds,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, sm: false, md: false, lg: false, xl: false });
  const isSmallMobile = useBreakpointValue({ base: true, sm: false, md: false, lg: false, xl: false });

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const selectionColor = useColorModeValue('blue.500', 'blue.300');

  // Responsive grid configuration
  const gridConfig = {
    columns: {
      base: 2,      // 2 colunas no mobile muito pequeno
      sm: 3,        // 3 colunas no mobile pequeno
      md: 3,        // 3 colunas no tablet
      lg: 4,        // 4 colunas no desktop
      xl: 5         // 5 colunas no desktop grande
    },
    spacing: {
      base: 2,      // Espaçamento menor no mobile
      sm: 3,        // Espaçamento padrão
      md: 3,
      lg: 4,
      xl: 4
    },
    imageSize: {
      base: '120px',    // Tamanho menor no mobile
      sm: '140px',      // Tamanho médio
      md: '160px',      // Tamanho padrão
      lg: '180px',      // Tamanho desktop
      xl: '200px'       // Tamanho grande
    }
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    const newSelectionMode = !isSelectionMode;
    setIsSelectionMode(newSelectionMode);
    if (isSelectionMode) {
      setSelectedImageIds([]);
    }
  };

  // Check if image is selected
  const isImageSelected = (imageId) => {
    // Convert both to strings for consistent comparison
    const imageIdStr = String(imageId);
    return selectedImageIds.some(id => String(id) === imageIdStr);
  };

  // Handle image selection - CORRIGIDO
  const handleImageSelection = (imageId, event) => {
    event?.stopPropagation?.(); // Previne o evento de bubble
    
    // Garantir que setSelectedImageIds existe antes de usar
    if (!setSelectedImageIds) {
      console.warn('setSelectedImageIds function not provided');
      return;
    }
    
    // Convert both to strings for consistent comparison
    const imageIdStr = String(imageId);
    const isCurrentlySelected = selectedImageIds.some(id => String(id) === imageIdStr);
    
    if (isCurrentlySelected) {
      const newSelectedIds = selectedImageIds.filter(id => String(id) !== imageIdStr);
      setSelectedImageIds(newSelectedIds);
    } else {
      const newSelectedIds = [...selectedImageIds, imageId];
      setSelectedImageIds(newSelectedIds);
    }
  };

  // Handle image click - CORRIGIDO
  const handleImageClick = (index, event) => {
    if (isSelectionMode) {
      // Em modo de seleção, alterna a seleção da imagem
      const imageId = images[index].id;
      handleImageSelection(imageId, event);
    } else {
      // Modo normal - abre modal
      setCurrentImageIndex(index);
      onOpen();
    }
  };

  // Modal functions
  const closeModal = () => {
    onClose();
  };

  const showNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const showPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Empty state
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <VStack spacing={8} py={20} textAlign="center">
        <Box
          w="140px"
          h="140px"
          borderRadius="full"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={6}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <Text fontSize="5xl" color="gray.400">
            📸
          </Text>
        </Box>
        <VStack spacing={3}>
          <Text fontSize="2xl" color={textColor} fontWeight="semibold">
            No Photos Yet
          </Text>
          <Text fontSize="md" color="gray.500" maxW="450px" lineHeight="1.6">
            Start capturing your journey by uploading your first photo to this country
          </Text>
        </VStack>
        <Button
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          px={10}
          py={7}
          onClick={() => (window.location.href = '/upload')}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        >
          Upload Photos
        </Button>
      </VStack>
    );
  }

  return (
    <Box bg={bgColor} py={2}>
      {/* Selection Controls */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" maxW="1200px" mx="auto" px={6}>
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme={isSelectionMode ? 'blue' : 'gray'}
              variant={isSelectionMode ? 'solid' : 'outline'}
              onClick={toggleSelectionMode}
              leftIcon={isSelectionMode ? <CheckIcon /> : undefined}
              borderRadius="full"
              px={6}
              transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Photos'}
            </Button>
            
            {isSelectionMode && (
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.600">
                  {selectedImageIds.length} selected
                </Text>
                
                <DeleteButton
                  onDelete={() => onDeleteSelectedImages(selectedImageIds)}
                  isDisabled={selectedImageIds.length === 0}
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  borderRadius="full"
                  px={4}
                  leftIcon={<CloseIcon />}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                >
                  Delete Selected
                </DeleteButton>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Responsive Grid */}
      <Box maxW="1400px" mx="auto" px={{ base: 2, sm: 4, md: 6 }}>
        <SimpleGrid
          columns={gridConfig.columns}
          spacing={gridConfig.spacing}
          sx={{ 
            columnGap: { base: '6px', sm: '8px', md: '12px' }, 
            rowGap: { base: '6px', sm: '8px', md: '12px' } 
          }}
        >
          {images.map((image, index) => {
            const isSelected = isImageSelected(image.id);
            
            return (
              <motion.div
                key={image.id ?? index}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                layout
                style={{ 
                  breakInside: 'avoid', 
                  marginBottom: { base: '6px', sm: '8px', md: '12px' },
                  transformOrigin: 'center center'
                }}
                transition={{
                  layout: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  scale: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
              >
                <Box
                  position="relative"
                  borderRadius={{ base: "6px", sm: "8px", md: "12px" }}
                  overflow="hidden"
                  bg="white"
                  boxShadow={isSelected ? `0 0 0 3px ${selectionColor}, 0 4px 20px rgba(59, 130, 246, 0.3)` : '0 2px 8px rgba(0, 0, 0, 0.08)'}
                  cursor="pointer"
                  _hover={{ 
                    boxShadow: isSelected 
                      ? `0 0 0 3px ${selectionColor}, 0 6px 25px rgba(59, 130, 246, 0.4)` 
                      : '0 8px 25px rgba(0, 0, 0, 0.15)' 
                  }}
                  transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  role="group"
                  aria-label={`Image from ${
                    countries.getName(image.countryId?.toUpperCase(), 'en') || 'Unknown'
                  }`}
                  onClick={(e) => handleImageClick(index, e)}
                >
                   {/* Selection overlay - CORRIGIDO */}
                   <AnimatePresence mode="wait">
                     {isSelectionMode && (
                       <motion.div
                         key={`overlay-${image.id}`}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                       >
                         <Box
                           position="absolute"
                           top="0"
                           left="0"
                           right="0"
                           bottom="0"
                           bg={isSelected ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.05)'}
                           zIndex={2}
                           display="flex"
                           alignItems="center"
                           justifyContent="center"
                           transition="all 0.2s ease"
                         >
                                                       <Checkbox
                              size={isMobile ? "md" : "lg"}
                              colorScheme="blue"
                              isChecked={isSelected}
                              bg="white"
                              borderRadius="full"
                              p={isMobile ? 2 : 3}
                              boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
                              border="2px solid"
                              borderColor={isSelected ? 'blue.500' : 'gray.300'}
                              _checked={{
                                bg: 'blue.500',
                                borderColor: 'blue.500',
                                transform: 'scale(1.1)',
                              }}
                              transition="all 0.2s ease"
                              // Removido onChange para evitar duplo disparo
                              // A seleção é controlada apenas pelo clique na imagem
                            />
                         </Box>
                       </motion.div>
                     )}
                   </AnimatePresence>

                  {/* Image */}
                  <Box position="relative" overflow="hidden" borderRadius={isMobile ? "8px" : "12px"}>
                    <Image
                      src={image.url}
                      alt={`Photo from ${
                        countries.getName(image.countryId?.toUpperCase(), 'en') || 'Unknown'
                      }`}
                      width="100%"
                      height="auto"
                      objectFit="cover"
                      loading="lazy"
                      fallbackSrc="https://via.placeholder.com/300x300?text=Photo"
                      sx={{ 
                        aspectRatio: '1/1', 
                        minHeight: isMobile ? '120px' : '200px',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        filter: isSelected ? 'brightness(0.95) contrast(1.05)' : 'none',
                      }}
                      _groupHover={{ 
                        transform: isSelectionMode 
                          ? 'scale(1.01)' 
                          : 'scale(1.05)' 
                      }}
                    />
                  </Box>

                  {/* Country / year footer - Responsive */}
                  <Box 
                    position="absolute" 
                    bottom="0" 
                    left="0" 
                    right="0" 
                    bg="linear-gradient(transparent, rgba(0, 0, 0, 0.7))" 
                    p={isMobile ? 2 : 3} 
                    color="white"
                  >
                    <VStack spacing={isMobile ? 0.5 : 1} align="start">
                      <Text 
                        fontSize={isMobile ? "xs" : "sm"} 
                        fontWeight="semibold" 
                        lineHeight="1.2"
                        noOfLines={1}
                      >
                        {countries.getName(image.countryId?.toUpperCase(), 'en') ||
                          image.countryId?.toUpperCase()}
                      </Text>
                      {image.year && (
                        <Text 
                          fontSize={isMobile ? "2xs" : "xs"} 
                          opacity={0.9}
                          noOfLines={1}
                        >
                          {image.year}
                        </Text>
                      )}
                    </VStack>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Full-size image modal */}
      {images[currentImageIndex] && (
        <FullImageModal
          isOpen={isOpen}
          onClose={closeModal}
          imageUrl={images[currentImageIndex].url}
          onNext={showNextImage}
          onPrev={showPrevImage}
          hasMultiple={images.length > 1}
          fullscreenRef={fullscreenRef}
          toggleFullScreen={toggleFullScreen}
          isFullscreen={isFullscreen}
          countryName={
            countries.getName(images[currentImageIndex].countryId?.toUpperCase(), 'en') || 'Unknown'
          }
          currentIndex={currentImageIndex}
          totalCount={images.length}
        />
      )}
    </Box>
  );
});

PhotoGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      countryId: PropTypes.string,
    })
  ).isRequired,
  onDeleteSelectedImages: PropTypes.func,
  selectedImageIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  setSelectedImageIds: PropTypes.func,
};

export default PhotoGallery;