/**
 * Componente de configurações para o gerador de vídeo
 */

import React from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { presetMusics } from '../../services/video/audioProcessor';

const VideoSettings = ({ 
  settings, 
  onSettingsChange, 
  audioFile, 
  onAudioFileChange,
  audioUrl 
}) => {
  const inputBg = useColorModeValue('white', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  const handleSettingChange = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleAudioFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      onAudioFileChange(file);
    }
  };

  return (
    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
      {/* Duração por foto */}
      <FormControl>
        <FormLabel color={textColor}>Duration per photo (seconds)</FormLabel>
        <NumberInput
          value={settings.duration}
          onChange={(valueString) => handleSettingChange('duration', parseFloat(valueString))}
          min={0.5}
          max={10}
          step={0.1}
          bg={inputBg}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      {/* Tipo de transição */}
      <FormControl>
        <FormLabel color={textColor}>Transition type</FormLabel>
        <Select
          value={settings.transition}
          onChange={(e) => handleSettingChange('transition', e.target.value)}
          bg={inputBg}
        >
          <option value="dynamic">🎭 Dynamic (Smart)</option>
          <option value="fade">🌅 Fade</option>
          <option value="slide">➡️ Slide</option>
          <option value="zoom">🔍 Zoom</option>
          <option value="kenBurns">🎬 Ken Burns</option>
          <option value="wipe">🧹 Wipe</option>
          <option value="spiral">🌀 Spiral</option>
          <option value="bounce">⚡ Bounce</option>
          <option value="flip3d">🔄 Flip 3D</option>
        </Select>
      </FormControl>

      {/* Modo dinâmico (apenas se dynamic estiver selecionado) */}
      {settings.transition === 'dynamic' && (
        <FormControl>
          <FormLabel color={textColor}>Dynamic mode</FormLabel>
          <Select
            value={settings.dynamicMode}
            onChange={(e) => handleSettingChange('dynamicMode', e.target.value)}
            bg={inputBg}
          >
            <option value="smart">🧠 Smart (Context-based)</option>
            <option value="random">🎲 Random</option>
            <option value="sequential">📋 Sequential</option>
          </Select>
        </FormControl>
      )}

      {/* Duração da transição */}
      <FormControl>
        <FormLabel color={textColor}>
          Transition duration: {settings.transitionDuration}s
        </FormLabel>
        <Slider
          value={settings.transitionDuration}
          onChange={(value) => handleSettingChange('transitionDuration', value)}
          min={0.1}
          max={2}
          step={0.1}
          colorScheme="blue"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>

      {/* Resolução */}
      <FormControl>
        <FormLabel color={textColor}>Resolution</FormLabel>
        <Select
          value={settings.resolution}
          onChange={(e) => handleSettingChange('resolution', e.target.value)}
          bg={inputBg}
        >
          <option value="720p">🖥️ 720p (1280x720)</option>
          <option value="1080p">📺 1080p (1920x1080)</option>
          <option value="1440p">🖨️ 1440p (2560x1440)</option>
          <option value="stories-hd">📱 Stories HD (1080x1920) - Vertical</option>
          <option value="stories-4k">📱 Stories 4K (1440x2560) - Vertical</option>
          <option value="reel-standard">📱 Instagram Feed (1080x1350) - Square</option>
        </Select>
        <Text fontSize="xs" color={mutedTextColor} mt={1}>
          {settings.resolution.includes('stories') && 
            '💡 Stories format: Smart crop will preserve image meaning for landscape photos'
          }
        </Text>
      </FormControl>

      {/* Smart Crop para Stories */}
      {settings.resolution.includes('stories') && (
        <FormControl>
          <FormLabel color={textColor}>Smart Crop for Landscape Photos</FormLabel>
          <Select
            value={settings.smartCrop || 'center'}
            onChange={(e) => handleSettingChange('smartCrop', e.target.value)}
            bg={inputBg}
          >
            <option value="center">🎯 Center Crop (Default)</option>
            <option value="face-detection">👤 Face Detection (Best for portraits)</option>
            <option value="object-detection">🔍 Object Detection (Best for landscapes)</option>
            <option value="rule-of-thirds">📐 Rule of Thirds (Artistic composition)</option>
          </Select>
          <Text fontSize="xs" color={mutedTextColor} mt={1}>
            Choose how to crop landscape photos for vertical Stories format
          </Text>
        </FormControl>
      )}

      {/* FPS */}
      <FormControl>
        <FormLabel color={textColor}>Frames per second (FPS)</FormLabel>
        <Select
          value={settings.fps}
          onChange={(e) => handleSettingChange('fps', parseInt(e.target.value))}
          bg={inputBg}
        >
          <option value={24}>🎬 24 FPS (Cinema)</option>
          <option value={30}>📹 30 FPS (Standard)</option>
          <option value={60}>⚡ 60 FPS (Smooth)</option>
        </Select>
      </FormControl>

      {/* Switches de texto */}
      <HStack justify="space-between">
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-year" mb="0" color={textColor}>
            Show year text
          </FormLabel>
          <Switch
            id="show-year"
            isChecked={settings.showYearText}
            onChange={(e) => handleSettingChange('showYearText', e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="show-count" mb="0" color={textColor}>
            Show photo count
          </FormLabel>
          <Switch
            id="show-count"
            isChecked={settings.showPhotoCount}
            onChange={(e) => handleSettingChange('showPhotoCount', e.target.checked)}
            colorScheme="blue"
          />
        </FormControl>
      </HStack>

      {/* Efeitos adicionais */}
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="enable-particles" mb="0" color={textColor}>
          Enable particle effects
        </FormLabel>
        <Switch
          id="enable-particles"
          isChecked={settings.enableParticles}
          onChange={(e) => handleSettingChange('enableParticles', e.target.checked)}
          colorScheme="purple"
        />
      </FormControl>

      {/* Configurações de música */}
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor="enable-music" mb="0" color={textColor}>
          Enable background music
        </FormLabel>
        <Switch
          id="enable-music"
          isChecked={settings.musicEnabled}
          onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
          colorScheme="green"
        />
      </FormControl>

      {settings.musicEnabled && (
        <VStack spacing={3} align="stretch">
          {/* Fonte de música */}
          <FormControl>
            <FormLabel color={textColor}>Music source</FormLabel>
            <Select
              value={settings.musicSource}
              onChange={(e) => handleSettingChange('musicSource', e.target.value)}
              bg={inputBg}
            >
              <option value="none">🚫 No music</option>
              <option value="upload">📁 Upload file</option>
              <option value="preset">🎵 Preset music</option>
            </Select>
          </FormControl>

          {/* Upload de arquivo */}
          {settings.musicSource === 'upload' && (
            <FormControl>
              <FormLabel color={textColor}>Audio file</FormLabel>
              <Input
                id="audio-upload"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileSelect}
                bg={inputBg}
                border="2px dashed"
                borderColor="gray.300"
                _hover={{ borderColor: "blue.400" }}
                pt={1}
              />
              {audioFile && (
                <Text fontSize="sm" color="green.500" mt={1}>
                  ✅ {audioFile.name}
                </Text>
              )}
              {audioUrl && !audioFile && (
                <Text fontSize="sm" color="blue.500" mt={1}>
                  🎵 Audio loaded from previous session
                </Text>
              )}
            </FormControl>
          )}

          {/* Música preset */}
          {settings.musicSource === 'preset' && (
            <FormControl>
              <FormLabel color={textColor}>Preset music</FormLabel>
              <Select
                value={settings.selectedPresetMusic}
                onChange={(e) => handleSettingChange('selectedPresetMusic', e.target.value)}
                bg={inputBg}
              >
                {Object.entries(presetMusics).map(([key, music]) => (
                  <option key={key} value={key}>
                    🎵 {music.name} - {music.description}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Volume da música */}
          <FormControl>
            <FormLabel color={textColor}>
              Music volume: {Math.round(settings.musicVolume * 100)}%
            </FormLabel>
            <Slider
              value={settings.musicVolume}
              onChange={(value) => handleSettingChange('musicVolume', value)}
              min={0}
              max={1}
              step={0.1}
              colorScheme="green"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
        </VStack>
      )}

      {/* Informação sobre configurações */}
      <Text fontSize="sm" color={mutedTextColor} textAlign="center" mt={4}>
        💡 Tip: Higher FPS and resolution will increase processing time but improve quality
      </Text>
    </VStack>
  );
};

export default VideoSettings;
