import React, { memo, useEffect, useCallback } from 'react';
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
  ({ isOpen, onClose, imageUrl, onNext, onPrev, hasMultiple, fullscreenRef, toggleFullScreen, isFullscreen, countryName }) => {
    // Color scheme
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const accentColor = useColorModeValue('teal.500', 'teal.300');
    const buttonBg = useColorModeValue('gray.100', 'gray.700');

    // Responsive modal size
    const modalSize = useBreakpointValue({ base: 'full', md: '4xl', lg: '5xl' });

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

    // Focus management for accessibility
    useEffect(() => {
      if (isOpen) {
        const focusable = document.querySelector('[aria-label="Close modal"]');
        if (focusable) focusable.focus();
      }
    }, [isOpen]);

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={modalSize}
        motionPreset="scale"
        isCentered
      >
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
        >
          <ModalBody p={{ base: 2, md: 4 }} position="relative">
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
            >
              <Image 
                src={logo} 
                alt="Photomap Logo" 
                h={{ base: '24px', md: '32px' }}
                mr={2}
              />
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

            {/* Close Button - Fixed */}
            <IconButton
              icon={<FiX />}
              aria-label="Close modal"
              position="absolute"
              top={{ base: '8px', md: '10px' }}
              right={{ base: '8px', md: '10px' }}
              colorScheme="red"
              variant="solid"
              size="lg"
              zIndex="50" // Increased z-index
              _hover={{ bg: 'red.600', color: 'white' }}
              transition="all 0.2s ease"
              onClick={onClose} // Simplified onClick handler
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
                >
                  {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                    <>
                      {/* Control Buttons - Moved outside TransformComponent */}
                      <Flex justify="center" wrap="wrap" gap={2} zIndex="40">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            zoomOut();
                          }}
                          icon={<FiZoomOut />}
                          aria-label="Zoom out"
                          size="md"
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
                          size="md"
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
                          size="md"
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
                          height: isFullscreen ? '100vh' : '70vh', // Altura máxima definida
                          maxHeight: isFullscreen ? '100vh' : '70vh',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden', // Evita overflow
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
                          maxWidth={isFullscreen ? '95vw' : '90%'} // Largura máxima limitada
                          maxHeight={isFullscreen ? '90vh' : '60vh'} // Altura máxima limitada
                          width="auto"
                          height="auto"
                          objectFit="contain" // Mantém proporção
                          borderRadius="md"
                          boxShadow="lg"
                          loading="lazy"
                          fallbackSrc="https://via.placeholder.com/800"
                          style={{
                            maxWidth: isFullscreen ? '95vw' : '90%',
                            maxHeight: isFullscreen ? '90vh' : '60vh',
                            objectFit: 'contain',
                          }}
                        />
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
                  icon={<Text fontSize={{ base: 'xl', md: '2xl' }}>&lsaquo;</Text>}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                  aria-label="Previous image"
                  position="absolute"
                  top="50%"
                  left={{ base: '8px', md: '20px' }}
                  transform="translateY(-50%)"
                  zIndex="40"
                  variant="ghost"
                  size="lg"
                  color={textColor}
                  _hover={{ bg: accentColor, color: 'white' }}
                  transition="all 0.2s ease"
                />
                <IconButton
                  icon={<Text fontSize={{ base: 'xl', md: '2xl' }}>&rsaquo;</Text>}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  aria-label="Next image"
                  position="absolute"
                  top="50%"
                  right={{ base: '8px', md: '20px' }}
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