import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
  Flex,
  VStack,
  Image,
  Text,
  Box,
  useColorModeValue,
  useBreakpointValue,
  Heading,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import logo from '../../assets/logo.png';

// Animation variants for modal content
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const FullImageModal = memo(
  ({
    isOpen,
    onClose,
    imageUrl,
    onNext,
    onPrev,
    hasMultiple,
    fullscreenRef,
    toggleFullScreen,
    isFullscreen,
    countryName,
  }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const isMobile = useBreakpointValue({ base: true, md: false });

    // guarda scale atual para decidir se swipe deve navegar (apenas sem zoom)
    const currentScaleRef = useRef(1);
    const touchStartXRef = useRef(0);
    const touchStartYRef = useRef(0);
    const swipedRef = useRef(false);
    const SWIPE_THRESHOLD = 50; // px
    const VSWIPE_TOLERANCE = 40; // px

    // Color scheme
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const accentColor = useColorModeValue('teal.500', 'teal.300');
    const buttonBg = useColorModeValue('gray.100', 'gray.700');

    // Responsive modal size
    const modalSize = useBreakpointValue({ base: 'full', md: '5xl', lg: '6xl' });

    // Reset transform quando entra/sai do fullscreen
    const handleFullscreenChange = useCallback(
      (resetTransform, centerView) => {
        if (isFullscreen) {
          resetTransform();
          centerView();
        }
      },
      [isFullscreen]
    );

    // Focus management para acessibilidade
    useEffect(() => {
      if (isOpen) {
        const focusable = document.querySelector('[aria-label="Close modal"]');
        if (focusable) focusable.focus();
      }
    }, [isOpen]);

    // Swipe handlers (apenas navega se não estiver com zoom)
    const onTouchStart = (e) => {
      if (!e.touches?.[0]) return;
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      swipedRef.current = false;
    };

    const onTouchMove = (e) => {
      if (!e.touches?.[0]) return;
      if (currentScaleRef.current > 1.05) return; // desabilita navegação por swipe se tiver zoom
      const dx = e.touches[0].clientX - touchStartXRef.current;
      const dy = e.touches[0].clientY - touchStartYRef.current;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dy) < VSWIPE_TOLERANCE) {
        swipedRef.current = true;
        if (dx < 0 && onNext) onNext();
        if (dx > 0 && onPrev) onPrev();
      }
    };

    const onTouchEnd = () => {
      // noop
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} motionPreset="scale" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
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
          h={{ base: '100vh', md: 'auto' }}
        >
          <ModalBody
            p={{ base: 0, md: 4 }}
            position="relative"
            pb={{ base: 'calc(env(safe-area-inset-bottom) + 56px)', md: 4 }}
          >
            {/* Watermark Logo - Top Left */}
            <Flex
              position="absolute"
              top={{ base: '8px', md: '10px' }}
              left={{ base: '8px', md: '10px' }}
              zIndex="45"
              align="center"
              opacity={0.7}
              _hover={{ opacity: 0.9 }}
              transition="opacity 0.3s ease"
              cursor="default"
              pointerEvents="none"
            >
              <Image src={logo} alt="Photomap Logo" h={{ base: '24px', md: '32px' }} mr={2} />
              <Heading
                size={{ base: 'xs', md: 'sm' }}
                color={textColor}
                fontWeight="800"
                letterSpacing="tight"
                textShadow="0 1px 2px rgba(0, 0, 0, 0.3)"
              >
                Photomap
              </Heading>
            </Flex>

            {/* Close Button */}
            <IconButton
              icon={<FiX />}
              aria-label="Close modal"
              position="absolute"
              top={{ base: '8px', md: '10px' }}
              right={{ base: '8px', md: '10px' }}
              colorScheme="red"
              variant="solid"
              size="lg"
              zIndex="50"
              _hover={{ bg: 'red.600', color: 'white' }}
              transition="all 0.2s ease"
              onClick={onClose}
            />

            <Box ref={fullscreenRef}>
              <VStack spacing={{ base: 2, md: 4 }} align="stretch">
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={3}
                  wheel={{ step: 0.2 }}
                  doubleClick={{ disabled: true }}
                  pinch={{ step: 5 }}
                  centerOnInit
                  centerZoomedOut
                  onInit={(state) => {
                    if (isFullscreen) state.centerView();
                  }}
                  onStateChange={(state) => handleFullscreenChange(state.resetTransform, state.centerView)}
                  onZoomStop={({ state }) => {
                    currentScaleRef.current = state.scale ?? 1;
                  }}
                  onPanningStop={({ state }) => {
                    currentScaleRef.current = state.scale ?? 1;
                  }}
                >
                  {({ zoomIn, zoomOut, centerView }) => (
                    <>
                      {/* Controles: top (desktop) / dock bottom (mobile) */}
                      <Flex
                        justify="center"
                        wrap="wrap"
                        gap={2}
                        zIndex="40"
                        position={{ base: 'absolute', md: 'static' }}
                        bottom={{ base: 0, md: 'auto' }}
                        left={{ base: 0, md: 'auto' }}
                        right={{ base: 0, md: 'auto' }}
                        bg={{ base: 'rgba(0,0,0,0.35)', md: 'transparent' }}
                        px={{ base: 3, md: 0 }}
                        py={{ base: 2, md: 0 }}
                        style={{ backdropFilter: isMobile ? 'blur(6px)' : undefined }}
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            zoomOut();
                          }}
                          icon={<FiZoomOut />}
                          aria-label="Zoom out"
                          size={isMobile ? 'lg' : 'md'}
                          bg={buttonBg}
                          color={textColor}
                          _hover={{ bg: accentColor, color: 'white' }}
                          transition="all 0.2s ease"
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            zoomIn();
                          }}
                          icon={<FiZoomIn />}
                          aria-label="Zoom in"
                          size={isMobile ? 'lg' : 'md'}
                          bg={buttonBg}
                          color={textColor}
                          _hover={{ bg: accentColor, color: 'white' }}
                          transition="all 0.2s ease"
                        />
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFullScreen();
                            if (!isFullscreen) centerView();
                          }}
                          icon={<FiMaximize />}
                          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                          size={isMobile ? 'lg' : 'md'}
                          bg={buttonBg}
                          color={textColor}
                          _hover={{ bg: accentColor, color: 'white' }}
                          transition="all 0.2s ease"
                        />
                      </Flex>

                      {/* Image Container */}
                      <TransformComponent
                        wrapperStyle={{
                          width: '100%',
                          height: isFullscreen
                            ? '100vh'
                            : isMobile
                              ? 'calc(100vh - 112px)'
                              : '70vh',
                          maxHeight: isFullscreen
                            ? '100vh'
                            : isMobile
                              ? 'calc(100vh - 112px)'
                              : '70vh',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                        }}
                        contentStyle={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          w="100%"
                          h="100%"
                          onTouchStart={onTouchStart}
                          onTouchMove={onTouchMove}
                          onTouchEnd={onTouchEnd}
                        >
                          {!imgLoaded && (
                            <Center w="100%" h="100%">
                              <Spinner size="xl" thickness="4px" />
                            </Center>
                          )}
                          <Image
                            src={imageUrl}
                            alt={`Full-size image from ${countryName || 'Unknown'}`}
                            maxWidth={isFullscreen ? '95vw' : isMobile ? '100%' : '90%'}
                            maxHeight={isFullscreen ? '90vh' : isMobile ? '100%' : '60vh'}
                            width="auto"
                            height="auto"
                            objectFit="contain"
                            borderRadius={{ base: 0, md: 'md' }}
                            boxShadow={{ base: 'none', md: 'lg' }}
                            loading="lazy"
                            fallbackSrc="https://via.placeholder.com/800"
                            onLoad={() => setImgLoaded(true)}
                            style={{
                              maxWidth: isFullscreen ? '95vw' : isMobile ? '100%' : '90%',
                              maxHeight: isFullscreen ? '90vh' : isMobile ? '100%' : '60vh',
                              objectFit: 'contain',
                              display: imgLoaded ? 'block' : 'none',
                            }}
                          />
                        </Box>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>

                {/* Image Metadata */}
                {countryName && (
                  <Flex justify="center" mt={2}>
                    <Text
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight="medium"
                      color={textColor}
                      bg="rgba(0, 0, 0, 0.6)"
                      px={3}
                      py={1}
                      borderRadius="md"
                    >
                      {countryName}
                    </Text>
                  </Flex>
                )}
              </VStack>
            </Box>

            {/* Navigation Arrows */}
            {hasMultiple && (
              <>
                <IconButton
                  icon={<Text fontSize={{ base: '2xl', md: '3xl' }}>&lsaquo;</Text>}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev && onPrev();
                  }}
                  aria-label="Previous image"
                  position="absolute"
                  top="50%"
                  left={{ base: '6px', md: '20px' }}
                  transform="translateY(-50%)"
                  zIndex="40"
                  variant="ghost"
                  size="lg"
                  color={textColor}
                  _hover={{ bg: accentColor, color: 'white' }}
                  transition="all 0.2s ease"
                />
                <IconButton
                  icon={<Text fontSize={{ base: '2xl', md: '3xl' }}>&rsaquo;</Text>}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext && onNext();
                  }}
                  aria-label="Next image"
                  position="absolute"
                  top="50%"
                  right={{ base: '6px', md: '20px' }}
                  transform="translateY(-50%)"
                  zIndex="40"
                  variant="ghost"
                  size="lg"
                  color={textColor}
                  _hover={{ bg: accentColor, color: 'white' }}
                  transition="all 0.2s ease"
                />
              </>
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
