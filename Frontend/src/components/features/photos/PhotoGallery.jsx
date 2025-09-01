import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
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
  HStack,
  Checkbox,
  useBreakpointValue,
  Icon,
  Tooltip,
  Kbd,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { IoCheckmark } from 'react-icons/io5';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { DeleteButton } from '../../ui/buttons/CustomButtons';
import FullImageModal from '../../modals/FullImageModal';
import { motion } from 'framer-motion';

// Registrar nomes de países
countries.registerLocale(en);

// Animações estilo Apple Photos
const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
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
  isSelectionMode = false,
  toggleSelectionMode,
  handleImageSelection,
  isImageSelected,
  onSelectAll,         // NEW: selecionar todos do conjunto mostrado
  onClearSelection,    // NEW: limpar seleção
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const selectionColor = useColorModeValue('blue.500', 'blue.300');

  // Clique na imagem
  const handleImageClick = useCallback(
    (index) => {
      if (isSelectionMode) {
        const imageId = images[index].id;
        handleImageSelection?.(imageId);
      } else {
        setCurrentImageIndex(index);
        onOpen();
      }
    },
    [isSelectionMode, images, handleImageSelection, onOpen]
  );

  // Modal
  const closeModal = () => onClose();
  const showNextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const showPrevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
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
          _hover={{ transform: 'scale(1.05)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)' }}
        >
          <Text fontSize="5xl" color="gray.400">📸</Text>
        </Box>
        <VStack spacing={3}>
          <Text fontSize="2xl" color={textColor} fontWeight="semibold">No Photos Yet</Text>
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
          _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)' }}
          _active={{ transform: 'translateY(0)' }}
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        >
          Upload Photos
        </Button>
      </VStack>
    );
  }

  const total = images.length;
  const selectedCount = selectedImageIds.length;

  return (
    <Box bg={bgColor} py={2}>
      {/* Selection Controls */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" maxW="1200px" mx="auto" px={6}>
          <HStack spacing={3} wrap="wrap">
            <Button
              size="sm"
              colorScheme={isSelectionMode ? 'blue' : 'gray'}
              variant={isSelectionMode ? 'solid' : 'outline'}
              onClick={() => {
                if (toggleSelectionMode) toggleSelectionMode();
              }}
              leftIcon={isSelectionMode ? <CheckIcon /> : undefined}
              borderRadius="full"
              px={6}
              transition="all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              _hover={{ transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              _active={{ transform: 'translateY(0)' }}
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Photos'}
            </Button>

            {isSelectionMode && (
              <>
                <Tooltip label="Select all photos currently visible" hasArrow>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectAll?.(images)}
                    borderRadius="full"
                  >
                    Select All ({total})
                  </Button>
                </Tooltip>

                <Tooltip label="Clear current selection" hasArrow>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onClearSelection?.()}
                    borderRadius="full"
                  >
                    Unselect All
                  </Button>
                </Tooltip>

                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    {selectedCount} selected
                  </Text>
                  <DeleteButton
                    onClick={() => onDeleteSelectedImages?.(selectedImageIds)}
                    isDisabled={selectedCount === 0}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    borderRadius="full"
                    px={4}
                    leftIcon={<CloseIcon />}
                  >
                    Delete Selected
                  </DeleteButton>
                </HStack>
              </>
            )}
          </HStack>

          {isSelectionMode && (
            <HStack spacing={2} opacity={0.8}>
              <Text fontSize="xs" color="gray.500">Tips:</Text>
              <Kbd>Click</Kbd>
              <Text fontSize="xs" color="gray.500">to toggle</Text>
            </HStack>
          )}
        </Flex>
      </Box>

      {/* Grid */}
      <Box maxW="1400px" mx="auto" px={{ base: 2, sm: 4, md: 6 }}>
        <SimpleGrid
          columns={{ base: 2, sm: 3, md: 3, lg: 4, xl: 5 }}
          spacing={{ base: 2, sm: 3, md: 3, lg: 4 }}
          sx={{
            columnGap: { base: '6px', sm: '8px', md: '12px' },
            rowGap: { base: '6px', sm: '8px', md: '12px' },
          }}
        >
          {images.map((image, index) => {
            const isSelected = isImageSelected ? isImageSelected(image.id) : false;
            const countryName =
              countries.getName(image.countryId?.toUpperCase?.(), 'en') ||
              image.countryId?.toUpperCase?.() ||
              'Unknown';

            return (
              <motion.div
                key={image.id}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                layout
                style={{ breakInside: 'avoid', transformOrigin: 'center center' }}
                transition={{
                  layout: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  scale: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
              >
                <Box
                  position="relative"
                  borderRadius={{ base: '6px', sm: '8px', md: '12px' }}
                  overflow="hidden"
                  bg="white"
                  boxShadow={
                    isSelected
                      ? `0 0 0 3px ${selectionColor}, 0 4px 20px rgba(59,130,246,0.3)`
                      : '0 2px 8px rgba(0,0,0,0.08)'
                  }
                  cursor="pointer"
                  _hover={{
                    boxShadow: isSelected
                      ? `0 0 0 3px ${selectionColor}, 0 6px 25px rgba(59,130,246,0.4)`
                      : '0 8px 25px rgba(0,0,0,0.15)',
                  }}
                  transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  role="group"
                  aria-label={`Image from ${countryName}`}
                  onClick={() => handleImageClick(index)}
                >
                  {/* Overlay sutil quando selecionado */}
                  {isSelectionMode && (
                    <Box
                      position="absolute"
                      inset="0"
                      bg={isSelected ? 'rgba(59,130,246,0.14)' : 'transparent'}
                      zIndex={1}
                      pointerEvents="none"
                      transition="all 0.2s ease"
                    />
                  )}

                  {/* Checkbox PRO no canto superior direito */}
                  {isSelectionMode && (
                    <Box
                      position="absolute"
                      top="10px"
                      right="10px"
                      zIndex={3}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        size={isMobile ? 'md' : 'lg'}
                        isChecked={isSelected}
                        aria-label={isSelected ? 'Deselect photo' : 'Select photo'}
                        onChange={() => handleImageSelection?.(image.id)}
                        icon={<Icon as={IoCheckmark} boxSize={isMobile ? 3.5 : 4} />}
                        colorScheme="blue"
                        sx={{
                          // “pill” pro
                          rounded: 'full',
                          p: isMobile ? 1 : 1.5,
                          bg: useColorModeValue('whiteAlpha.900', 'blackAlpha.700'),
                          backdropFilter: 'saturate(180%) blur(6px)',
                          borderWidth: '2px',
                          borderColor: isSelected ? 'blue.500' : useColorModeValue('gray.300', 'gray.600'),
                          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                          transition: 'all 0.18s ease',
                          _hover: {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 10px 24px rgba(0,0,0,0.24)',
                          },
                          '& .chakra-checkbox__control': {
                            rounded: 'full',
                            border: 'none',
                            bg: 'transparent',
                          },
                          '&[data-checked]': {
                            bg: useColorModeValue('white', 'blackAlpha.700'),
                            borderColor: 'blue.500',
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Imagem */}
                  <Box position="relative" overflow="hidden" borderRadius={isMobile ? '8px' : '12px'}>
                    <Image
                      src={image.url}
                      alt={`Photo from ${countryName}`}
                      width="100%"
                      height="auto"
                      objectFit="cover"
                      loading="lazy"
                      fallbackSrc="https://via.placeholder.com/300x300?text=Photo"
                      sx={{
                        aspectRatio: '1/1',
                        minHeight: isMobile ? '120px' : '200px',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        filter: isSelected ? 'brightness(0.96) contrast(1.04)' : 'none',
                      }}
                      _groupHover={{ transform: isSelectionMode ? 'scale(1.01)' : 'scale(1.05)' }}
                    />
                  </Box>

                  {/* Rodapé país/ano */}
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="linear-gradient(transparent, rgba(0,0,0,0.7))"
                    p={isMobile ? 2 : 3}
                    color="white"
                  >
                    <VStack spacing={isMobile ? 0.5 : 1} align="start">
                      <Text fontSize={isMobile ? 'xs' : 'sm'} fontWeight="semibold" lineHeight="1.2" noOfLines={1}>
                        {countryName}
                      </Text>
                      {image.year && (
                        <Text fontSize={isMobile ? '2xs' : 'xs'} opacity={0.9} noOfLines={1}>
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

      {/* Modal de imagem cheia */}
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
            countries.getName(images[currentImageIndex].countryId?.toUpperCase?.(), 'en') || 'Unknown'
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
  isSelectionMode: PropTypes.bool,
  toggleSelectionMode: PropTypes.func,
  handleImageSelection: PropTypes.func,
  isImageSelected: PropTypes.func,
  onSelectAll: PropTypes.func,
  onClearSelection: PropTypes.func,
};

export default PhotoGallery;
