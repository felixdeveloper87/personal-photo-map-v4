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

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const selectionColor = useColorModeValue('blue.500', 'blue.400');
  const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.700');

  // Normalize selected IDs to ensure consistent ccomparison - use useMemo to prevent unnecessary recalculations
  const normalizedSelectedIds = useMemo(() => 
    selectedImageIds.map(id => String(id)), 
    [selectedImageIds]
  );

  // Check if an image is selected
  const isImageSelected = (imageId) => {
    return normalizedSelectedIds.includes(String(imageId));
  };

  // Toggle selection mode
  const toggleSelectionMode = () => {
    const newSelectionMode = !isSelectionMode;
    setIsSelectionMode(newSelectionMode);
    
    if (newSelectionMode) {
      // Apple-like behavior: automatically select first few images when entering selection mode
      if (images.length > 0 && setSelectedImageIds) {
        const initialSelection = images.slice(0, Math.min(3, images.length)).map(img => img.id);
        setSelectedImageIds(initialSelection);
      }
    } else {
      // Clear selection when exiting
      if (setSelectedImageIds) {
        setSelectedImageIds([]);
      }
    }
  };

  // Handle image selection
  const handleImageSelection = (imageId, event) => {
    event?.stopPropagation?.();
    
    if (!setSelectedImageIds) return;
    
    const stringId = String(imageId);
    
    // Check if Shift key is pressed for range selection
    if (event?.shiftKey && selectedImageIds.length > 0) {
      const currentIndex = images.findIndex(img => img.id === imageId);
      const lastSelectedIndex = images.findIndex(img => img.id === selectedImageIds[selectedImageIds.length - 1]);
      
      if (currentIndex !== -1 && lastSelectedIndex !== -1) {
        const start = Math.min(currentIndex, lastSelectedIndex);
        const end = Math.max(currentIndex, lastSelectedIndex);
        const rangeIds = images.slice(start, end + 1).map(img => img.id);
        
        // Merge with existing selection, avoiding duplicates
        const newSelection = [...new Set([...selectedImageIds, ...rangeIds])];
        setSelectedImageIds(newSelection);
        return;
      }
    }
    
    if (normalizedSelectedIds.includes(stringId)) {
      // Remove from selection - filter out the clicked image
      const newSelection = selectedImageIds.filter(id => String(id) !== stringId);
      setSelectedImageIds(newSelection);
    } else {
      // Add to selection - add the original imageId (not stringId)
      const newSelection = [...selectedImageIds, imageId];
      setSelectedImageIds(newSelection);
    }
  };

  // Select all images
  const selectAllImages = () => {
    if (!setSelectedImageIds) return;
    const allIds = images.map(img => img.id);
    setSelectedImageIds(allIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    if (!setSelectedImageIds) return;
    setSelectedImageIds([]);
  };

  // Open modal on image click (only if not in selection mode)
  const handleImageClick = (index, event) => {
    
    if (isSelectionMode) {
      // In selection mode, don't do anything when clicking the image
      // Users should use the checkbox for selection
      return;
    } else {
      setCurrentImageIndex(index);
      onOpen();
    }
  };

  const closeModal = () => onClose();

  const showNextImage = (e, nextIndex) => {
    e?.stopPropagation?.();
    if (!images?.length) return;
    const targetIndex = nextIndex !== undefined ? nextIndex : (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(targetIndex);
  };

  const showPrevImage = (e, prevIndex) => {
    e?.stopPropagation?.();
    if (!images?.length) return;
    const targetIndex = prevIndex !== undefined ? prevIndex : (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(targetIndex);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') showNextImage(event);
      else if (event.key === 'ArrowLeft') showPrevImage(event);
      else if (event.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentImageIndex, images?.length]);

  const handleDeleteSelected = () => {
    if (onDeleteSelectedImages && selectedImageIds.length > 0) {
      onDeleteSelectedImages(selectedImageIds);
    }
    clearAllSelections();
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement && fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
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
              <>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={selectAllImages}
                  borderRadius="full"
                  px={4}
                  transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  _hover={{
                    bg: 'blue.50',
                    transform: 'translateY(-1px)',
                  }}
                >
                  Select All
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={clearAllSelections}
                  borderRadius="full"
                  px={4}
                  transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  _hover={{
                    bg: 'red.50',
                    transform: 'translateY(-1px)',
                  }}
                >
                  Clear All
                </Button>
                <Text 
                  fontSize="xs" 
                  color="gray.500" 
                  fontStyle="italic"
                  px={3}
                  py={2}
                  bg="gray.50"
                  borderRadius="full"
                >
                  💡 Shift+Click para seleção em lote
                </Text>
              </>
            )}
          </HStack>

          {selectedImageIds.length > 0 && (
            <HStack spacing={3}>
              <Badge 
                colorScheme="blue" 
                variant="solid" 
                borderRadius="full" 
                px={4} 
                py={2}
                fontSize="sm"
                fontWeight="semibold"
                boxShadow="0 2px 8px rgba(59, 130, 246, 0.3)"
              >
                {selectedImageIds.length}
              </Badge>
              <Text fontWeight="medium" color={textColor}>
                {selectedImageIds.length === 1 ? 'Photo' : 'Photos'} Selected
              </Text>
              <DeleteButton
                size="sm"
                borderRadius="full"
                colorScheme="red"
                onClick={handleDeleteSelected}
                leftIcon={<CloseIcon />}
                px={6}
                transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
              >
                Delete Selected
              </DeleteButton>
            </HStack>
          )}
        </Flex>
      </Box>

      {/* Grid */}
      <Box maxW="1400px" mx="auto" px={6}>
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          spacing={3}
          sx={{ columnGap: '12px', rowGap: '12px' }}
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
                  marginBottom: '12px',
                  transformOrigin: 'center center'
                }}
                transition={{
                  layout: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  scale: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
              >
                <Box
                  position="relative"
                  borderRadius="12px"
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
                   {/* Selection overlay */}
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
                             size="lg"
                             colorScheme="blue"
                             isChecked={isSelected}
                             bg="white"
                             borderRadius="full"
                             p={3}
                             boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
                             border="2px solid"
                             borderColor={isSelected ? 'blue.500' : 'gray.300'}
                             _checked={{
                               bg: 'blue.500',
                               borderColor: 'blue.500',
                               transform: 'scale(1.1)',
                             }}
                             transition="all 0.2s ease"
                             onChange={(e) => {
                               e?.stopPropagation?.();
                               handleImageSelection(image.id, e);
                             }}
                             onClick={(e) => e?.stopPropagation?.()}
                           />
                         </Box>
                       </motion.div>
                     )}
                   </AnimatePresence>

                  {/* Image */}
                  <Box position="relative" overflow="hidden" borderRadius="12px">
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
                        minHeight: '200px', 
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

                  {/* Country / year footer */}
                  <Box 
                    position="absolute" 
                    bottom="0" 
                    left="0" 
                    right="0" 
                    bg="linear-gradient(transparent, rgba(0, 0, 0, 0.7))" 
                    p={3} 
                    color="white"
                  >
                    <VStack spacing={1} align="start">
                      <Text fontSize="sm" fontWeight="semibold" lineHeight="1.2">
                        {countries.getName(image.countryId?.toUpperCase(), 'en') ||
                          image.countryId?.toUpperCase()}
                      </Text>
                      {image.year && (
                        <Text fontSize="xs" opacity={0.9}>
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
