import React, { memo, useEffect, useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
  Button,
  Flex,
  VStack,
  Image,
  Text,
  Box,
  useColorModeValue,
  useBreakpointValue,
  HStack,
  Heading,
  useToast,
  Fade,
  Portal,
} from '@chakra-ui/react';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import logo from '../../assets/logo.png';
import '../../styles/landing.css';

// Animation variants for modal content
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// Swipe animation variants
const swipeVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: { duration: 0.3 }
  })
};

// Hook para detectar gestos de swipe
const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 100) => {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const onTouchStart = useCallback((e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchMove = useCallback((e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

const FullImageModal = memo(
  ({ isOpen, onClose, imageUrl, onNext, onPrev, hasMultiple, fullscreenRef, toggleFullScreen, isFullscreen, countryName }) => {
    // State management
    const [showControls, setShowControls] = useState(true);
    const [swipeDirection, setSwipeDirection] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [imageKey, setImageKey] = useState(0);
    const controlsTimeoutRef = useRef(null);
    
    const toast = useToast();

    // Color scheme
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const accentColor = useColorModeValue('teal.500', 'teal.300');
    const buttonBg = useColorModeValue('gray.100', 'gray.700');
    const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.800');

    // Responsive values
    const modalSize = useBreakpointValue({ base: 'full', md: '4xl', lg: '5xl' });
    const isMobile = useBreakpointValue({ base: true, md: false });
    const imageHeight = useBreakpointValue({ 
      base: isFullscreen ? '100vh' : '75vh', 
      md: isFullscreen ? '100vh' : '70vh' 
    });
    const buttonSize = useBreakpointValue({ base: 'lg', md: 'md' });
    const controlsOpacity = useBreakpointValue({ base: showControls ? 1 : 0, md: 1 });

    // Navigation handlers with swipe animation
    const handleNext = useCallback(() => {
      if (onNext) {
        setSwipeDirection(1);
        setImageKey(prev => prev + 1);
        onNext();
      }
    }, [onNext]);

    const handlePrev = useCallback(() => {
      if (onPrev) {
        setSwipeDirection(-1);
        setImageKey(prev => prev + 1);
        onPrev();
      }
    }, [onPrev]);

    // Swipe gesture handlers
    const swipeHandlers = useSwipeGesture(
      hasMultiple ? handleNext : null,
      hasMultiple ? handlePrev : null,
      50 // Lower threshold for easier swiping
    );

    // Auto-hide controls on mobile
    const handleUserInteraction = useCallback(() => {
      if (isMobile) {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    }, [isMobile]);

    // Reset transform when entering/exiting fullscreen
    const handleFullscreenChange = useCallback(
      (resetTransform, centerView) => {
        if (isFullscreen) {
          resetTransform();
          centerView();
        }
      },
      [isFullscreen]
    );

    // Image load handler
    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
      setIsLoading(false);
      toast({
        title: "Erro ao carregar imagem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }, [toast]);

    // Focus management and setup
    useEffect(() => {
      if (isOpen) {
        setImageKey(prev => prev + 1);
        setIsLoading(true);
        const focusable = document.querySelector('[aria-label="Close modal"]');
        if (focusable) focusable.focus();
        
        // Hide controls after delay on mobile
        if (isMobile) {
          handleUserInteraction();
        }
      }
      
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [isOpen, isMobile, handleUserInteraction]);

    // Reset loading state when image changes
    useEffect(() => {
      setIsLoading(true);
      setImageKey(prev => prev + 1);
    }, [imageUrl]);

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={modalSize}
        motionPreset="scale"
        isCentered
        blockScrollOnMount
        closeOnOverlayClick={!isMobile}
      >
        <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
        <ModalContent
          as={motion.div}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          bg={bgColor}
          borderRadius={{ base: 0, md: 'lg' }}
          boxShadow="2xl"
          overflow="hidden"
          maxH="100vh"
          {...(isMobile && swipeHandlers)}
          onClick={isMobile ? handleUserInteraction : undefined}
        >
          <ModalBody p={{ base: 1, md: 4 }} position="relative" h="100%">
            {/* Loading overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 60
                  }}
                >
                  <Box
                    w="40px"
                    h="40px"
                    border="4px solid"
                    borderColor="gray.200"
                    borderTopColor={accentColor}
                    borderRadius="50%"
                    animation="spin 1s linear infinite"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls Overlay */}
            <Fade in={controlsOpacity === 1}>
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                zIndex={50}
                bg="linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)"
                p={{ base: 2, md: 4 }}
              >
                {/* Top Bar with Logo and Close */}
                <Flex justify="space-between" align="center">
                  <Flex align="center" opacity={0.9}>
                    <Image 
                      src={logo} 
                      alt="Photomap Logo" 
                      h={{ base: '20px', md: '28px' }}
                      mr={2}
                    />
                    <Heading
                      size={{ base: 'xs', md: 'sm' }}
                      color="white"
                      fontWeight="700"
                      textShadow="0 1px 3px rgba(0, 0, 0, 0.8)"
                    >
                      Photomap
                    </Heading>
                  </Flex>

                  <IconButton
                    icon={<FiX />}
                    aria-label="Close modal"
                    variant="solid"
                    size={buttonSize}
                    colorScheme="red"
                    borderRadius="full"
                    _hover={{ 
                      bg: 'red.600', 
                      transform: 'scale(1.05)',
                      boxShadow: 'lg' 
                    }}
                    _active={{ transform: 'scale(0.95)' }}
                    transition="all 0.2s ease"
                    onClick={onClose}
                  />
                </Flex>
              </Box>
            </Fade>

            <Box ref={fullscreenRef} h="100%">
              <VStack spacing={{ base: 1, md: 3 }} align="stretch" h="100%">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.3}
                  maxScale={4}
                  wheel={{ step: 0.15 }}
                  doubleClick={{ 
                    disabled: false,
                    mode: 'zoomIn',
                    step: 0.7
                  }}
                  pinch={{ 
                    step: 3,
                    disabled: false 
                  }}
                  centerOnInit
                  centerZoomedOut
                  limitToBounds={false}
                  onInit={(state) => {
                    if (isFullscreen) state.centerView();
                  }}
                  onStateChange={(state) => handleFullscreenChange(state.resetTransform, state.centerView)}
                >
                  {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                    <>
                      {/* Bottom Control Panel */}
                      <Fade in={controlsOpacity === 1}>
                        <Box
                          position="absolute"
                          bottom={0}
                          left={0}
                          right={0}
                          zIndex={45}
                          bg="linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)"
                          p={{ base: 3, md: 4 }}
                        >
                          <VStack spacing={3}>
                            {/* Country Name */}
                            {countryName && (
                              <Text
                                fontSize={{ base: 'sm', md: 'md' }}
                                fontWeight="600"
                                color="white"
                                textAlign="center"
                                bg="rgba(0, 0, 0, 0.7)"
                                px={4}
                                py={2}
                                borderRadius="full"
                                backdropFilter="blur(10px)"
                                textShadow="0 1px 3px rgba(0, 0, 0, 0.8)"
                              >
                                📍 {countryName}
                              </Text>
                            )}

                            {/* Control Buttons */}
                            <HStack spacing={3} justify="center">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  zoomOut();
                                  if (isMobile) handleUserInteraction();
                                }}
                                icon={<FiZoomOut />}
                                aria-label="Zoom out"
                                size={buttonSize}
                                borderRadius="full"
                                bg="rgba(255, 255, 255, 0.15)"
                                color="white"
                                backdropFilter="blur(10px)"
                                border="1px solid rgba(255, 255, 255, 0.2)"
                                _hover={{ 
                                  bg: accentColor, 
                                  transform: 'scale(1.05)',
                                  boxShadow: 'lg' 
                                }}
                                _active={{ transform: 'scale(0.95)' }}
                                transition="all 0.2s ease"
                              />
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetTransform();
                                  centerView();
                                  if (isMobile) handleUserInteraction();
                                }}
                                icon={<Box w="3" h="3" bg="currentColor" borderRadius="sm" />}
                                aria-label="Reset zoom"
                                size={buttonSize}
                                borderRadius="full"
                                bg="rgba(255, 255, 255, 0.15)"
                                color="white"
                                backdropFilter="blur(10px)"
                                border="1px solid rgba(255, 255, 255, 0.2)"
                                _hover={{ 
                                  bg: accentColor, 
                                  transform: 'scale(1.05)',
                                  boxShadow: 'lg' 
                                }}
                                _active={{ transform: 'scale(0.95)' }}
                                transition="all 0.2s ease"
                              />
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  zoomIn();
                                  if (isMobile) handleUserInteraction();
                                }}
                                icon={<FiZoomIn />}
                                aria-label="Zoom in"
                                size={buttonSize}
                                borderRadius="full"
                                bg="rgba(255, 255, 255, 0.15)"
                                color="white"
                                backdropFilter="blur(10px)"
                                border="1px solid rgba(255, 255, 255, 0.2)"
                                _hover={{ 
                                  bg: accentColor, 
                                  transform: 'scale(1.05)',
                                  boxShadow: 'lg' 
                                }}
                                _active={{ transform: 'scale(0.95)' }}
                                transition="all 0.2s ease"
                              />
                              {!isMobile && (
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFullScreen();
                                    if (!isFullscreen) centerView();
                                  }}
                                  icon={<FiMaximize />}
                                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                                  size={buttonSize}
                                  borderRadius="full"
                                  bg="rgba(255, 255, 255, 0.15)"
                                  color="white"
                                  backdropFilter="blur(10px)"
                                  border="1px solid rgba(255, 255, 255, 0.2)"
                                  _hover={{ 
                                    bg: accentColor, 
                                    transform: 'scale(1.05)',
                                    boxShadow: 'lg' 
                                  }}
                                  _active={{ transform: 'scale(0.95)' }}
                                  transition="all 0.2s ease"
                                />
                              )}
                            </HStack>
                          </VStack>
                        </Box>
                      </Fade>

                      {/* Image Container with Swipe Animation */}
                      <Box
                        position="relative"
                        w="100%"
                        h={imageHeight}
                        overflow="hidden"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg="black"
                        borderRadius={{ base: 0, md: 'lg' }}
                      >
                        <AnimatePresence mode="wait" custom={swipeDirection}>
                          <motion.div
                            key={imageKey}
                            custom={swipeDirection}
                            variants={swipeVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <TransformComponent
                              wrapperStyle={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: isMobile ? 'default' : 'grab',
                              }}
                              contentStyle={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Image
                                src={imageUrl}
                                alt={`Full-size image from ${countryName || 'Unknown'}`}
                                maxWidth="100%"
                                maxHeight="100%"
                                width="auto"
                                height="auto"
                                objectFit="contain"
                                borderRadius={{ base: 0, md: 'md' }}
                                loading="lazy"
                                fallbackSrc="https://via.placeholder.com/800x600/2D3748/CBD5E0?text=Loading..."
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                style={{
                                  userSelect: 'none',
                                  WebkitUserSelect: 'none',
                                  pointerEvents: 'none',
                                }}
                              />
                            </TransformComponent>
                          </motion.div>
                        </AnimatePresence>

                        {/* Mobile Swipe Indicator */}
                        {isMobile && hasMultiple && (
                          <Fade in={controlsOpacity === 1}>
                            <Text
                              position="absolute"
                              bottom="20px"
                              left="50%"
                              transform="translateX(-50%)"
                              color="white"
                              fontSize="sm"
                              fontWeight="500"
                              bg="rgba(0, 0, 0, 0.6)"
                              px={3}
                              py={1}
                              borderRadius="full"
                              backdropFilter="blur(10px)"
                              textShadow="0 1px 3px rgba(0, 0, 0, 0.8)"
                              zIndex={40}
                            >
                              ← Deslize para navegar →
                            </Text>
                          </Fade>
                        )}
                      </Box>
                    </>
                  )}
                </TransformWrapper>
              </VStack>
            </Box>

            {/* Navigation Arrows - Hidden on mobile in favor of swipe */}
            {hasMultiple && !isMobile && (
              <Fade in={controlsOpacity === 1}>
                <>
                  <IconButton
                    icon={<FiChevronLeft />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label="Previous image"
                    position="absolute"
                    top="50%"
                    left={{ base: '8px', md: '20px' }}
                    transform="translateY(-50%)"
                    zIndex={40}
                    size="lg"
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.15)"
                    color="white"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    _hover={{ 
                      bg: accentColor, 
                      transform: 'translateY(-50%) scale(1.1)',
                      boxShadow: 'lg' 
                    }}
                    _active={{ transform: 'translateY(-50%) scale(0.95)' }}
                    transition="all 0.2s ease"
                  />
                  <IconButton
                    icon={<FiChevronRight />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="Next image"
                    position="absolute"
                    top="50%"
                    right={{ base: '8px', md: '20px' }}
                    transform="translateY(-50%)"
                    zIndex={40}
                    size="lg"
                    borderRadius="full"
                    bg="rgba(255, 255, 255, 0.15)"
                    color="white"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                    _hover={{ 
                      bg: accentColor, 
                      transform: 'translateY(-50%) scale(1.1)',
                      boxShadow: 'lg' 
                    }}
                    _active={{ transform: 'translateY(-50%) scale(0.95)' }}
                    transition="all 0.2s ease"
                  />
                </>
              </Fade>
            )}

            {/* Mobile-specific navigation indicators */}
            {hasMultiple && isMobile && (
              <Fade in={controlsOpacity === 1}>
                <HStack
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  zIndex={35}
                  spacing={8}
                  pointerEvents="none"
                >
                  <Box
                    w={12}
                    h={12}
                    bg="rgba(255, 255, 255, 0.1)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                  >
                    <FiChevronLeft color="white" size={20} />
                  </Box>
                  <Box
                    w={12}
                    h={12}
                    bg="rgba(255, 255, 255, 0.1)"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255, 255, 255, 0.2)"
                  >
                    <FiChevronRight color="white" size={20} />
                  </Box>
                </HStack>
              </Fade>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

FullImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  hasMultiple: PropTypes.bool,
  fullscreenRef: PropTypes.object,
  toggleFullScreen: PropTypes.func,
  isFullscreen: PropTypes.bool,
  countryName: PropTypes.string,
};

export default FullImageModal;