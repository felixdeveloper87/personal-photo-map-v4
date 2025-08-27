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
  Box,
  useColorModeValue,
  useBreakpointValue,
  Heading,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import logo from '../../assets/logo.png';

// Animation variants
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
    countryName, // opcional
    // opcionais para wrap "consciente"
    currentIndex,
    totalCount,
  }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const isMobile = useBreakpointValue({ base: true, md: false });

    // ----- SWIPE STATE (mobile) -----
    const scaleRef = useRef(1);
    const startX = useRef(0);
    const startY = useRef(0);
    const startTimeRef = useRef(0);
    const didSwipeRef = useRef(false);
    const lastSwipeAtRef = useRef(0);

    // thresholds
    const SWIPE_MIN_DIST = 60;   // px: distância mínima no eixo X
    const V_TOLERANCE = 50;      // px: tolerância no eixo Y (para ser "horizontal")
    const SWIPE_MAX_TIME = 800;  // ms: tempo máximo do gesto
    const SWIPE_COOLDOWN = 250;  // ms: evita duplo avanço por tremulação

    // Cores
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const accentColor = useColorModeValue('teal.500', 'teal.300');
    const buttonBg = useColorModeValue('gray.100', 'gray.700');

    const modalSize = useBreakpointValue({ base: 'full', md: '5xl', lg: '6xl' });

    // Wrap helpers
    const canWrap =
      typeof currentIndex === 'number' &&
      typeof totalCount === 'number' &&
      totalCount > 0;

    const goNext = useCallback(() => {
      if (!hasMultiple) return;
      if (canWrap) {
        const next = (currentIndex + 1) % totalCount;
        onNext && onNext(next);
      } else {
        onNext && onNext();
      }
    }, [hasMultiple, canWrap, currentIndex, totalCount, onNext]);

    const goPrev = useCallback(() => {
      if (!hasMultiple) return;
      if (canWrap) {
        const prev = (currentIndex - 1 + totalCount) % totalCount;
        onPrev && onPrev(prev);
      } else {
        onPrev && onPrev();
      }
    }, [hasMultiple, canWrap, currentIndex, totalCount, onPrev]);

    const handleFullscreenChange = useCallback(
      (resetTransform, centerView) => {
        if (isFullscreen) {
          resetTransform();
          centerView();
        }
      },
      [isFullscreen]
    );

    useEffect(() => {
      if (isOpen) {
        const focusable = document.querySelector('[aria-label="Close modal"]');
        if (focusable) focusable.focus();
      }
    }, [isOpen]);

    // ----- TOUCH HANDLERS (mobile) -----
    const onTouchStart = (e) => {
      if (!hasMultiple) return;
      // ignora multi-touch (pinch, etc.)
      if (!e.touches || e.touches.length !== 1) return;
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startTimeRef.current = Date.now();
      didSwipeRef.current = false;
    };

    // não decidimos no move; só bloqueamos se zoomado
    const onTouchMove = (e) => {
      if (scaleRef.current > 1.05) return; // se estiver com zoom, não navega por swipe
      // quando o gesto é candidato a swipe horizontal, podemos opcionalmente evitar rolagem:
      // e.preventDefault(); // cuidado: só se necessário
    };

    const onTouchEnd = (e) => {
      if (!hasMultiple) return;
      if (didSwipeRef.current) return; // já processado
      if (scaleRef.current > 1.05) return; // com zoom, não navega
      const dt = Date.now() - startTimeRef.current;
      if (dt > SWIPE_MAX_TIME) return; // gesto lento demais

      const touch = e.changedTouches && e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      // checa cooldown
      if (Date.now() - lastSwipeAtRef.current < SWIPE_COOLDOWN) return;

      // precisa ser horizontal e com distância mínima
      if (Math.abs(dx) >= SWIPE_MIN_DIST && Math.abs(dy) <= V_TOLERANCE) {
        didSwipeRef.current = true;
        lastSwipeAtRef.current = Date.now();
        if (dx < 0) {
          // esquerda -> próxima
          goNext();
        } else {
          // direita -> anterior
          goPrev();
        }
      }
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
            {/* Logo / Marca d'água */}
            <Flex
              position="absolute"
              top={{ base: '8px', md: '10px' }}
              left={{ base: '8px', md: '10px' }}
              zIndex="45"
              align="center"
              opacity={0.7}
              pointerEvents="none"
            >
              <Image src={logo} alt="Photomap Logo" h={{ base: '24px', md: '32px' }} mr={2} />
              <Heading
                size={{ base: 'xs', md: 'sm' }}
                color={textColor}
                fontWeight="800"
                letterSpacing="tight"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                Photomap
              </Heading>
            </Flex>

            {/* Fechar */}
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
                  onStateChange={(state) =>
                    handleFullscreenChange(state.resetTransform, state.centerView)
                  }
                  onZoomStop={({ state }) => {
                    scaleRef.current = state.scale ?? 1;
                  }}
                  onPanningStop={({ state }) => {
                    scaleRef.current = state.scale ?? 1;
                  }}
                >
                  {({ zoomIn, zoomOut, centerView }) => (
                    <>
                      {/* Controles de zoom/fullscreen apenas no desktop */}
                      {!isMobile && (
                        <Flex justify="center" wrap="wrap" gap={2} zIndex="40" mb={2}>
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
                          />
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFullScreen?.();
                              if (!isFullscreen) centerView();
                            }}
                            icon={<FiMaximize />}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            size="md"
                            bg={buttonBg}
                            color={textColor}
                            _hover={{ bg: accentColor, color: 'white' }}
                          />
                        </Flex>
                      )}

                      {/* Área da imagem */}
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
                          // importante para reduzir interferência com scroll
                          style={{ touchAction: 'none' }}
                          onTouchStart={isMobile ? onTouchStart : undefined}
                          onTouchMove={isMobile ? onTouchMove : undefined}
                          onTouchEnd={isMobile ? onTouchEnd : undefined}
                        >
                          {!imgLoaded && (
                            <Center w="100%" h="100%">
                              <Spinner size="xl" thickness="4px" />
                            </Center>
                          )}
                          <Image
                            src={imageUrl}
                            alt={
                              countryName
                                ? `Full-size image from ${countryName}`
                                : 'Full-size image'
                            }
                            maxWidth={isFullscreen ? '95vw' : isMobile ? '100%' : '90%'}
                            maxHeight={isFullscreen ? '90vh' : isMobile ? '100%' : '60vh'}
                            width="auto"
                            height="auto"
                            objectFit="contain"
                            borderRadius={{ base: 0, md: 'md' }}
                            boxShadow={{ base: 'none', md: 'lg' }}
                            onLoad={() => setImgLoaded(true)}
                            style={{
                              display: imgLoaded ? 'block' : 'none',
                            }}
                          />
                        </Box>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </VStack>
            </Box>

            {/* Setas: só desktop; no mobile o swipe cuida */}
            {hasMultiple && !isMobile && (
              <>
                <IconButton
                  icon={<Text fontSize={{ base: '2xl', md: '3xl' }}>&lsaquo;</Text>}
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
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
                />
                <IconButton
                  icon={<Text fontSize={{ base: '2xl', md: '3xl' }}>&rsaquo;</Text>}
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
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
  currentIndex: PropTypes.number,
  totalCount: PropTypes.number,
};

export default FullImageModal;
