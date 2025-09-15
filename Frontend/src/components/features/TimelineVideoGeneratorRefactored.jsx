/**
 * Componente principal do gerador de vídeo timeline (Refatorado)
 */

import React, { useState, useContext } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Text,
  Button,
  Progress,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FaVideo, FaDownload, FaStop } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { useVideoGenerator } from '../../hooks/video/useVideoGenerator';
import VideoSettings from './VideoSettings';

const TimelineVideoGenerator = ({ images, onClose }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const {
    canvasRef,
    videoRef,
    isGenerating,
    progress,
    videoUrl,
    isConverting,
    conversionProgress,
    mp4VideoUrl,
    generateVideo,
    downloadVideo,
    stopGeneration,
  } = useVideoGenerator();

  // Cores do tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  // State para configurações
  const [settings, setSettings] = useState({
    duration: 1.5, // segundos por foto
    transition: 'dynamic', // dynamic, fade, slide, zoom, kenBurns, wipe, spiral, bounce, flip3d
    resolution: '1080p',
    fps: 30,
    showYearText: true,
    showPhotoCount: true,
    musicEnabled: false,
    musicSource: 'none', // 'none', 'upload', 'preset'
    musicVolume: 0.5,
    selectedPresetMusic: 'ambient1',
    transitionDuration: 0.8, // Duração da transição em segundos
    enableParticles: false, // Efeitos de partículas
    dynamicMode: 'smart', // 'smart', 'random', 'sequential'
    imageFitMode: 'fill', // 'fill', 'fit', 'stretch'
    smartCrop: 'center', // Para fill mode
  });

  // Audio settings
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  // Handlers
  const handleGenerateVideo = () => {
    generateVideo(images, settings, audioFile);
  };

  const handleAudioFileChange = (file) => {
    setAudioFile(file);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
    } else {
      setAudioUrl(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          You need to be logged in to generate timeline videos.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box 
      p={{ base: 4, md: 6 }} 
      bg={bgColor} 
      borderRadius="lg" 
      border={`1px solid ${borderColor}`}
    >
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          Timeline Video Generator
        </Text>

        {/* Settings */}
        <VideoSettings
          settings={settings}
          onSettingsChange={setSettings}
          audioFile={audioFile}
          onAudioFileChange={handleAudioFileChange}
          audioUrl={audioUrl}
        />

        {/* Canvas escondido para renderização */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Progress */}
        {(isGenerating || isConverting) && (
          <VStack spacing={4}>
            {isGenerating && (
              <VStack spacing={3}>
                <Text fontWeight="semibold" color={textColor}>
                  {progress === 100 ? 'Finalizing video...' : `Generating video... ${progress}%`}
                </Text>
                <Progress 
                  value={progress} 
                  colorScheme={progress === 100 ? "green" : "blue"} 
                  size="lg" 
                  borderRadius="md"
                  isAnimated={progress < 100}
                  hasStripe={progress < 100}
                />
                {progress < 100 && (
                  <Text fontSize="sm" color={mutedTextColor}>
                    Processing timeline video frames...
                  </Text>
                )}
              </VStack>
            )}

            {isConverting && (
              <VStack spacing={3}>
                <Text fontWeight="semibold" color={textColor}>
                  {conversionProgress === 100 ? 'Finalizing MP4 conversion...' : `Converting to MP4... ${conversionProgress}%`}
                </Text>
                <Progress 
                  value={conversionProgress} 
                  colorScheme="purple" 
                  size="lg" 
                  borderRadius="md"
                  isAnimated={conversionProgress < 100}
                  hasStripe={conversionProgress < 100}
                />
                <Text fontSize="sm" color={mutedTextColor}>
                  📱 Converting for iPhone compatibility...
                </Text>
              </VStack>
            )}
          </VStack>
        )}

        {/* Generated video */}
        {videoUrl && (
          <VStack spacing={3}>
            <HStack spacing={2}>
              <Text color="green.500" fontWeight="bold">Video generated successfully!</Text>
              {mp4VideoUrl && (
                <Text fontSize="sm" color="purple.500" fontWeight="semibold">
                  📱 MP4 Ready
                </Text>
              )}
            </HStack>
            <video
              ref={videoRef}
              src={mp4VideoUrl || videoUrl}
              controls
              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
            />
            <Text fontSize="sm" color={mutedTextColor}>
              Format: {mp4VideoUrl ? 'MP4 (iPhone compatible)' : 'WebM (Browser compatible)'}
            </Text>
          </VStack>
        )}

        {/* Buttons */}
        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 3, sm: 4 }} 
          justify="center"
          align="center"
        >
          {!isGenerating && !isConverting && !videoUrl && (
            <Button
              leftIcon={<FaVideo />}
              colorScheme="blue"
              size={{ base: "md", md: "lg" }}
              onClick={handleGenerateVideo}
              isDisabled={
                !images || 
                images.length === 0 || 
                (settings.musicEnabled && settings.musicSource === 'upload' && !audioFile)
              }
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
            >
              Generate Video ({images?.length || 0} photos)
            </Button>
          )}
          
          {/* Aviso se música está habilitada mas arquivo não foi carregado */}
          {settings.musicEnabled && settings.musicSource === 'upload' && !audioFile && (
            <Text fontSize="sm" color="orange.500" textAlign="center">
              ⚠️ Select an audio file or switch to "Preset music" to generate the video
            </Text>
          )}

          {(isGenerating || isConverting) && (
            <Button
              leftIcon={<FaStop />}
              colorScheme="red"
              size={{ base: "md", md: "lg" }}
              onClick={stopGeneration}
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
              isDisabled={isConverting} // Disable during conversion as it can't be safely stopped
            >
              {isConverting ? 'Converting...' : 'Stop Generation'}
            </Button>
          )}

          {videoUrl && !isConverting && (
            <Button
              leftIcon={<FaDownload />}
              colorScheme="green"
              size={{ base: "md", md: "lg" }}
              onClick={downloadVideo}
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
            >
              Download {mp4VideoUrl ? 'MP4' : 'WebM'}
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={onClose}
            borderColor={borderColor}
            color={textColor}
            _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
            size={{ base: "md", md: "lg" }}
            w={{ base: "100%", sm: "auto" }}
            minW="120px"
          >
            Close
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
};

export default TimelineVideoGenerator;
