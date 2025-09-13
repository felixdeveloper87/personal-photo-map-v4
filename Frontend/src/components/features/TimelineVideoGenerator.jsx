import React, { useState, useRef, useCallback, useContext } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  useToast,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Input,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FaVideo, FaDownload, FaPlay, FaStop } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { buildApiUrl } from '../../utils/apiConfig';

const TimelineVideoGenerator = ({ images, onClose }) => {
  const toast = useToast();
  const { isLoggedIn } = useContext(AuthContext);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Video settings
  const [settings, setSettings] = useState({
    duration: 1.5, // segundos por foto
    transition: 'fade', // fade, slide, zoom
    resolution: '1080p',
    fps: 30,
    showYearText: true,
    showPhotoCount: true,
    musicEnabled: false,
    musicSource: 'none', // 'none', 'upload', 'preset'
    musicVolume: 0.5,
    selectedPresetMusic: 'ambient1',
  });

  // Audio settings
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamDestinationRef = useRef(null);

  // Cores do tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.600');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  // Preset music (generated using Web Audio API)
  const presetMusics = {
    ambient1: { name: 'Calm Ambient', description: 'Relaxing tone for memories' },
    upbeat1: { name: 'Energetic', description: 'Animated rhythm for adventures' },
    nostalgic1: { name: 'Nostalgic', description: 'Melancholic for special moments' },
    cinematic1: { name: 'Cinematic', description: 'Epic for great moments' },
  };

  // Function to load image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Function to generate preset music using Web Audio API
  const generatePresetMusic = async (musicType, durationSeconds) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const numberOfChannels = 2;
    const length = sampleRate * durationSeconds;
    
    const audioBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        let value = 0;
        
        switch (musicType) {
          case 'ambient1':
            // Soft ambient tone with multiple frequencies
            value = Math.sin(2 * Math.PI * 220 * time) * 0.1 +
                   Math.sin(2 * Math.PI * 330 * time) * 0.08 +
                   Math.sin(2 * Math.PI * 440 * time) * 0.06;
            value *= Math.sin(2 * Math.PI * 0.5 * time); // Slow modulation
            break;
            
          case 'upbeat1':
            // More animated rhythm
            value = Math.sin(2 * Math.PI * 440 * time) * 0.2 +
                   Math.sin(2 * Math.PI * 880 * time) * 0.1;
            value *= (1 + Math.sin(2 * Math.PI * 4 * time)) * 0.5; // Fast beat
            break;
            
          case 'nostalgic1':
            // Melancholic tone
            value = Math.sin(2 * Math.PI * 294 * time) * 0.15 + // D4
                   Math.sin(2 * Math.PI * 349 * time) * 0.12 + // F4
                   Math.sin(2 * Math.PI * 440 * time) * 0.1;  // A4
            value *= Math.exp(-time * 0.1); // Gradual fade out
            break;
            
          case 'cinematic1':
            // Epic cinematic sound
            value = Math.sin(2 * Math.PI * 110 * time) * 0.3 + // Bass
                   Math.sin(2 * Math.PI * 220 * time) * 0.2 +
                   Math.sin(2 * Math.PI * 440 * time) * 0.15;
            value *= (1 + Math.sin(2 * Math.PI * 0.25 * time)) * 0.5; // Slow crescendo
            break;
            
          default:
            value = 0;
        }
        
        channelData[i] = value * settings.musicVolume;
      }
    }
    
    return audioBuffer;
  };

  // Function to handle audio file upload
  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG)',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Detectar duração do áudio
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioDuration = audioBuffer.duration;
      const videoDuration = images.length * settings.duration;
      
      let message = `Arquivo "${file.name}" carregado com sucesso! `;
      
      if (audioDuration < videoDuration) {
        message += `A música (${Math.round(audioDuration)}s) será repetida para cobrir todo o vídeo (${Math.round(videoDuration)}s).`;
      } else if (audioDuration > videoDuration) {
        message += `A música (${Math.round(audioDuration)}s) será cortada para corresponder ao vídeo (${Math.round(videoDuration)}s).`;
      } else {
        message += `Duração perfeita para o vídeo!`;
      }
      
      toast({
        title: 'Áudio carregado',
        description: message,
        status: 'success',
        duration: 5000,
      });
      
      audioContext.close();
    } catch (error) {
      console.error('Erro ao analisar áudio:', error);
      toast({
        title: 'Áudio carregado',
        description: `Arquivo "${file.name}" pronto para usar`,
        status: 'success',
        duration: 3000,
      });
    }
  };

  // Função para configurar áudio para gravação
  const setupAudioForRecording = async (videoDuration) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      let audioBuffer;
      
      if (settings.musicSource === 'upload' && audioFile) {
        // Usar arquivo enviado pelo usuário
        const arrayBuffer = await audioFile.arrayBuffer();
        const originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        console.log('Áudio original:', {
          duration: originalAudioBuffer.duration,
          videoDuration: videoDuration,
          sampleRate: originalAudioBuffer.sampleRate,
          channels: originalAudioBuffer.numberOfChannels
        });
        
        // Ajustar duração do áudio para corresponder exatamente à duração do vídeo
        const targetLength = audioContext.sampleRate * videoDuration;
        const adjustedBuffer = audioContext.createBuffer(
          originalAudioBuffer.numberOfChannels,
          targetLength,
          audioContext.sampleRate
        );
        
        for (let channel = 0; channel < originalAudioBuffer.numberOfChannels; channel++) {
          const sourceData = originalAudioBuffer.getChannelData(channel);
          const targetData = adjustedBuffer.getChannelData(channel);
          
          if (originalAudioBuffer.duration < videoDuration) {
            // Áudio mais curto - repetir com fade entre repetições
            console.log('Áudio mais curto que vídeo - repetindo...');
            for (let i = 0; i < targetLength; i++) {
              const sourceIndex = i % sourceData.length;
              targetData[i] = sourceData[sourceIndex];
              
              // Fade suave entre repetições
              const cyclePosition = (i % sourceData.length) / sourceData.length;
              if (cyclePosition > 0.95) {
                const fadeAmount = (1 - cyclePosition) / 0.05;
                targetData[i] *= fadeAmount;
              } else if (cyclePosition < 0.05) {
                const fadeAmount = cyclePosition / 0.05;
                targetData[i] *= fadeAmount;
              }
            }
          } else if (originalAudioBuffer.duration > videoDuration) {
            // Áudio mais longo - cortar com fade out
            console.log('Áudio mais longo que vídeo - cortando...');
            for (let i = 0; i < targetLength; i++) {
              targetData[i] = sourceData[i];
              
              // Fade out nos últimos 2 segundos
              const fadeStartSample = targetLength - (audioContext.sampleRate * 2);
              if (i > fadeStartSample) {
                const fadeAmount = (targetLength - i) / (audioContext.sampleRate * 2);
                targetData[i] *= fadeAmount;
              }
            }
          } else {
            // Duração igual - copiar diretamente
            console.log('Duração do áudio igual à do vídeo');
            targetData.set(sourceData.slice(0, targetLength));
          }
        }
        
        audioBuffer = adjustedBuffer;
      } else if (settings.musicSource === 'preset') {
        // Usar música preset gerada
        audioBuffer = await generatePresetMusic(settings.selectedPresetMusic, videoDuration);
      } else {
        return null; // Sem áudio
      }
      
      // Criar source
      const audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      
      // Configurar volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = settings.musicVolume;
      
      // Conectar áudio ao destino
      const destination = audioContext.createMediaStreamDestination();
      audioSource.connect(gainNode);
      gainNode.connect(destination);
      
      mediaStreamDestinationRef.current = destination;
      
      console.log('Áudio conectado:', {
        bufferDuration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels,
        streamTracks: destination.stream.getAudioTracks().length
      });
      
      return { audioSource, audioStream: destination.stream, audioContext };
    } catch (error) {
      console.error('Erro ao configurar áudio:', error);
      toast({
        title: 'Erro no áudio',
        description: 'Não foi possível configurar o áudio. O vídeo será gerado sem som.',
        status: 'warning',
        duration: 5000,
      });
      return null;
    }
  };

  // Função para desenhar imagem com transição
  const drawImageWithTransition = (ctx, img, canvas, transitionType, progress) => {
    const { width, height } = canvas;
    
    // Calcular proporções para manter aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgAspect > canvasAspect) {
      // Imagem é mais larga
      drawHeight = height;
      drawWidth = height * imgAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Imagem é mais alta
      drawWidth = width;
      drawHeight = width / imgAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    ctx.save();
    
    switch (transitionType) {
      case 'fade':
        ctx.globalAlpha = progress;
        break;
      case 'slide':
        ctx.translate(width * (1 - progress), 0);
        break;
      case 'zoom':
        const scale = 0.5 + (progress * 0.5);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-width / 2, -height / 2);
        break;
    }
    
    // Limpar canvas
    if (transitionType === 'fade' && progress < 1) {
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = progress;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.restore();
  };

  // Função para adicionar texto ao canvas
  const addTextOverlay = (ctx, canvas, year, photoIndex, totalPhotos) => {
    if (!settings.showYearText && !settings.showPhotoCount) return;

    const { width, height } = canvas;
    ctx.save();
    
    // Configurar estilo do texto
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    
    if (settings.showYearText) {
      ctx.font = 'bold 48px Arial';
      const yearText = year.toString();
      const yearY = height - 100;
      ctx.strokeText(yearText, width / 2, yearY);
      ctx.fillText(yearText, width / 2, yearY);
    }
    
    if (settings.showPhotoCount) {
      ctx.font = 'bold 24px Arial';
      const countText = `${photoIndex + 1} / ${totalPhotos}`;
      const countY = height - 50;
      ctx.strokeText(countText, width / 2, countY);
      ctx.fillText(countText, width / 2, countY);
    }
    
    ctx.restore();
  };

  // Função principal para gerar o vídeo
  const generateVideo = useCallback(async () => {
    if (!images || images.length === 0) {
      toast({
        title: 'Erro',
        description: 'Nenhuma imagem disponível para gerar vídeo',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    recordedChunksRef.current = [];

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Configurar resolução
      const resolutions = {
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 },
        '1440p': { width: 2560, height: 1440 },
      };
      
      const resolution = resolutions[settings.resolution];
      canvas.width = resolution.width;
      canvas.height = resolution.height;

      // Calcular duração total do vídeo
      const totalVideoDuration = images.length * settings.duration;
      
      // Configurar áudio se habilitado
      let audioSetup = null;
      if (settings.musicEnabled && settings.musicSource !== 'none') {
        console.log('Configurando áudio:', {
          musicSource: settings.musicSource,
          musicVolume: settings.musicVolume,
          hasAudioFile: !!audioFile,
          audioFileName: audioFile?.name,
          videoDuration: totalVideoDuration
        });
        audioSetup = await setupAudioForRecording(totalVideoDuration);
        console.log('Áudio configurado:', !!audioSetup);
      }
      
      // Configurar MediaRecorder com ou sem áudio
      let stream = canvas.captureStream(settings.fps);
      
      if (audioSetup && audioSetup.audioStream) {
        // Combinar vídeo e áudio
        const audioTracks = audioSetup.audioStream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        
        stream = new MediaStream([...videoTracks, ...audioTracks]);
      }
      
      // Configurar MediaRecorder com suporte aprimorado para áudio
      let mediaRecorderOptions = {
        videoBitsPerSecond: 8000000, // 8 Mbps
      };
      
      // Tentar diferentes codecs para melhor compatibilidade de áudio
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mediaRecorderOptions.mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mediaRecorderOptions.mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mediaRecorderOptions.mimeType = 'video/webm';
      }
      
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setIsGenerating(false);
        
        toast({
          title: 'Vídeo gerado com sucesso!',
          description: 'Seu vídeo timeline está pronto para download',
          status: 'success',
          duration: 5000,
        });
      };

      // Agrupar imagens por ano
      const imagesByYear = images.reduce((acc, img) => {
        if (!acc[img.year]) acc[img.year] = [];
        acc[img.year].push(img);
        return acc;
      }, {});

      const years = Object.keys(imagesByYear).sort((a, b) => Number(a) - Number(b));
      
      // Iniciar gravação e áudio simultaneamente para melhor sincronização
      mediaRecorder.start();
      
      // Iniciar áudio se configurado - com timing preciso
      if (audioSetup && audioSetup.audioSource) {
        // Usar currentTime do audioContext para sincronização precisa
        const startTime = audioSetup.audioContext ? audioSetup.audioContext.currentTime + 0.1 : undefined;
        audioSetup.audioSource.start(startTime);
      }

      // Calcular total de frames
      const framesPerImage = settings.duration * settings.fps;
      const totalFrames = images.length * framesPerImage;
      let currentFrame = 0;

      // Processar cada ano
      for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
        const year = years[yearIndex];
        const yearImages = imagesByYear[year];
        
        // Processar cada imagem do ano
        for (let imgIndex = 0; imgIndex < yearImages.length; imgIndex++) {
          const image = yearImages[imgIndex];
          
          try {
            const img = await loadImage(image.url);
            
            // Tempo de início para esta imagem
            const imageStartTime = Date.now();
            
            // Animar a imagem
            for (let frame = 0; frame < framesPerImage; frame++) {
              const transitionProgress = Math.min(frame / (settings.fps * 0.5), 1); // 0.5s de transição
              
              // Limpar canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Desenhar imagem com transição
              drawImageWithTransition(ctx, img, canvas, settings.transition, transitionProgress);
              
              // Adicionar texto overlay
              const globalImageIndex = yearIndex * yearImages.length + imgIndex;
              addTextOverlay(ctx, canvas, year, globalImageIndex, images.length);
              
              // Sincronização mais precisa - aguardar o tempo correto para o próximo frame
              const targetTime = imageStartTime + (frame + 1) * (1000 / settings.fps);
              const currentTime = Date.now();
              const waitTime = Math.max(0, targetTime - currentTime);
              
              if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
              }
              
              // Atualizar progresso
              currentFrame++;
              const progressPercent = Math.min(Math.round((currentFrame / totalFrames) * 100), 100);
              setProgress(progressPercent);
            }
          } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            // Continuar com próxima imagem, mas ainda contar os frames
            currentFrame += framesPerImage;
            const progressPercent = Math.min(Math.round((currentFrame / totalFrames) * 100), 100);
            setProgress(progressPercent);
          }
        }
      }

      // Finalizar gravação
      setProgress(100); // Garantir que chegue a 100%
      
      // Aguardar um pouco antes de parar para garantir que todos os frames foram processados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Parar o áudio se estiver rodando
      if (audioSetup && audioSetup.audioSource) {
        try {
          audioSetup.audioSource.stop();
        } catch (error) {
          console.warn('Erro ao parar áudio:', error);
        }
      }
      
      // Parar a gravação
      mediaRecorder.stop();
      
      console.log('Gravação finalizada com áudio:', !!audioSetup);

    } catch (error) {
      console.error('Erro ao gerar vídeo:', error);
      setIsGenerating(false);
      toast({
        title: 'Erro ao gerar vídeo',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  }, [images, settings, toast]);

  // Função para fazer download do vídeo
  const downloadVideo = () => {
    if (!videoUrl) return;
    
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `timeline-video-${new Date().getTime()}.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para parar geração
  const stopGeneration = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsGenerating(false);
  };

  if (!isLoggedIn) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription>
          Você precisa estar logado para gerar vídeos do timeline.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" border={`1px solid ${borderColor}`}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color={textColor}>
          Timeline Video Generator
        </Text>

        {/* Settings */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel color={textColor}>Duration per photo (seconds)</FormLabel>
            <NumberInput
              value={settings.duration}
              onChange={(value) => setSettings({ ...settings, duration: Number(value) })}
              min={0.5}
              max={5}
              step={0.5}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Transition type</FormLabel>
            <Select
              value={settings.transition}
              onChange={(e) => setSettings({ ...settings, transition: e.target.value })}
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color={textColor}>Resolution</FormLabel>
            <Select
              value={settings.resolution}
              onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
            >
              <option value="720p">720p (1280x720)</option>
              <option value="1080p">1080p (1920x1080)</option>
              <option value="1440p">1440p (2560x1440)</option>
            </Select>
          </FormControl>

          <HStack justify="space-between">
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" color={textColor}>Show year</FormLabel>
              <Switch
                isChecked={settings.showYearText}
                onChange={(e) => setSettings({ ...settings, showYearText: e.target.checked })}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" color={textColor}>Show counter</FormLabel>
              <Switch
                isChecked={settings.showPhotoCount}
                onChange={(e) => setSettings({ ...settings, showPhotoCount: e.target.checked })}
              />
            </FormControl>
          </HStack>

          {/* Audio Settings */}
          <Divider borderColor={borderColor} />
          
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" fontWeight="bold" color={textColor}>Background music</FormLabel>
            <Switch
              isChecked={settings.musicEnabled}
              onChange={(e) => setSettings({ ...settings, musicEnabled: e.target.checked })}
            />
          </FormControl>

          {settings.musicEnabled && (
            <VStack spacing={4} align="stretch" p={4} bg={cardBg} borderRadius="md" border={`1px solid ${borderColor}`}>
              
              {/* Informação sobre duração do vídeo */}
              <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md" border={`1px solid ${useColorModeValue('blue.200', 'blue.600')}`}>
                <Text fontSize="sm" color={useColorModeValue('blue.700', 'blue.200')} fontWeight="semibold">
                  🎬 Duração do vídeo: {Math.round((images?.length || 0) * settings.duration)}s
                </Text>
                <Text fontSize="xs" color={useColorModeValue('blue.600', 'blue.300')}>
                  ({images?.length || 0} fotos × {settings.duration}s por foto)
                </Text>
              </Box>
              <FormControl>
                <FormLabel color={textColor}>Music source</FormLabel>
                <Select
                  value={settings.musicSource}
                  onChange={(e) => setSettings({ ...settings, musicSource: e.target.value })}
                  bg={inputBg}
                  color={textColor}
                  borderColor={borderColor}
                >
                  <option value="none">No music</option>
                  <option value="preset">Preset music</option>
                  <option value="upload">Upload your own file</option>
                </Select>
              </FormControl>

              {settings.musicSource === 'preset' && (
                <FormControl>
                  <FormLabel color={textColor}>Musical style</FormLabel>
                  <Select
                    value={settings.selectedPresetMusic}
                    onChange={(e) => setSettings({ ...settings, selectedPresetMusic: e.target.value })}
                    bg={inputBg}
                    color={textColor}
                    borderColor={borderColor}
                  >
                    {Object.entries(presetMusics).map(([key, music]) => (
                      <option key={key} value={key}>
                        {music.name} - {music.description}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {settings.musicSource === 'upload' && (
                <FormControl>
                  <FormLabel color={textColor}>Upload audio file</FormLabel>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    style={{ display: 'none' }}
                    id="audio-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="audio-upload"
                    cursor="pointer"
                    colorScheme={audioFile ? "green" : "blue"}
                    variant={audioFile ? "solid" : "outline"}
                    w="100%"
                    borderColor={borderColor}
                    color={textColor}
                    _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                  >
                    {audioFile ? `✓ ${audioFile.name}` : '📁 Selecionar Arquivo de Áudio'}
                  </Button>
                  {!audioFile && (
                    <Text fontSize="sm" color="orange.500" mt={2}>
                      ⚠️ Você precisa selecionar um arquivo de áudio primeiro
                    </Text>
                  )}
                  {audioFile && (
                    <Text fontSize="sm" color="green.500" mt={2}>
                      ✓ Arquivo carregado: {audioFile.name}
                    </Text>
                  )}
                  
                  {/* Mostrar duração estimada do vídeo */}
                  <Text fontSize="xs" color={mutedTextColor} mt={2}>
                    💡 Duração estimada do vídeo: {Math.round(images?.length * settings.duration || 0)}s 
                    ({images?.length || 0} fotos × {settings.duration}s cada)
                  </Text>
                </FormControl>
              )}

              <FormControl>
                <FormLabel color={textColor}>Music volume: {Math.round(settings.musicVolume * 100)}%</FormLabel>
                <Slider
                  value={settings.musicVolume}
                  onChange={(value) => setSettings({ ...settings, musicVolume: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  colorScheme="blue"
                >
                  <SliderTrack bg={useColorModeValue('gray.200', 'gray.600')}>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              {/* Audio preview */}
              {audioUrl && (
                <Box>
                  <FormLabel color={textColor}>Audio preview</FormLabel>
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    controls
                    style={{ width: '100%' }}
                  />
                </Box>
              )}
            </VStack>
          )}
        </VStack>

        <Divider borderColor={borderColor} />

        {/* Hidden canvas for generation */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Progress */}
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

        {/* Generated video */}
        {videoUrl && (
          <VStack spacing={3}>
            <Text color="green.500" fontWeight="bold">Video generated successfully!</Text>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
            />
          </VStack>
        )}

        {/* Buttons */}
        <HStack spacing={4} justify="center">
          {!isGenerating && !videoUrl && (
            <Button
              leftIcon={<FaVideo />}
              colorScheme="blue"
              size="lg"
              onClick={generateVideo}
              isDisabled={
                !images || 
                images.length === 0 || 
                (settings.musicEnabled && settings.musicSource === 'upload' && !audioFile)
              }
            >
              Generate Video ({images?.length || 0} photos)
            </Button>
          )}
          
          {/* Aviso se música está habilitada mas arquivo não foi carregado */}
          {settings.musicEnabled && settings.musicSource === 'upload' && !audioFile && (
            <Text fontSize="sm" color="orange.500" textAlign="center">
              ⚠️ Selecione um arquivo de áudio ou mude para "Preset music" para gerar o vídeo
            </Text>
          )}

          {isGenerating && (
            <Button
              leftIcon={<FaStop />}
              colorScheme="red"
              size="lg"
              onClick={stopGeneration}
            >
              Stop Generation
            </Button>
          )}

          {videoUrl && (
            <Button
              leftIcon={<FaDownload />}
              colorScheme="green"
              size="lg"
              onClick={downloadVideo}
            >
              Download Video
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={onClose}
            borderColor={borderColor}
            color={textColor}
            _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
          >
            Close
          </Button>
        </HStack>

        {/* Information */}
        <Alert status="info" bg={useColorModeValue('blue.50', 'blue.900')} borderColor={borderColor}>
          <AlertIcon />
          <AlertDescription color={textColor}>
            The video will be generated entirely in your browser, without sending data to any server.
            The process may take a few minutes depending on the number of photos and settings.
            {settings.musicEnabled && (
              <Box mt={2}>
                <Text fontWeight="semibold">🎵 Background music enabled:</Text>
                <Text fontSize="sm">
                  {settings.musicSource === 'preset' 
                    ? `Style: ${presetMusics[settings.selectedPresetMusic]?.name}` 
                    : settings.musicSource === 'upload' && audioFile
                    ? `File: ${audioFile.name}`
                    : 'Audio configuration pending'
                  }
                </Text>
              </Box>
            )}
          </AlertDescription>
        </Alert>
      </VStack>
    </Box>
  );
};

export default TimelineVideoGenerator;
