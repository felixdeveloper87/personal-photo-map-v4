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
    duration: 3, // segundos por foto
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

  // Músicas pré-definidas (usando Web Audio API para gerar tons)
  const presetMusics = {
    ambient1: { name: 'Ambiente Calmo', description: 'Tom relaxante para memórias' },
    upbeat1: { name: 'Energético', description: 'Ritmo animado para aventuras' },
    nostalgic1: { name: 'Nostálgico', description: 'Melancólico para lembranças' },
    cinematic1: { name: 'Cinematográfico', description: 'Épico para grandes momentos' },
  };

  // Função para carregar imagem
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Função para gerar música preset usando Web Audio API
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
            // Tom ambiente suave com múltiplas frequências
            value = Math.sin(2 * Math.PI * 220 * time) * 0.1 +
                   Math.sin(2 * Math.PI * 330 * time) * 0.08 +
                   Math.sin(2 * Math.PI * 440 * time) * 0.06;
            value *= Math.sin(2 * Math.PI * 0.5 * time); // Modulação lenta
            break;
            
          case 'upbeat1':
            // Ritmo mais animado
            value = Math.sin(2 * Math.PI * 440 * time) * 0.2 +
                   Math.sin(2 * Math.PI * 880 * time) * 0.1;
            value *= (1 + Math.sin(2 * Math.PI * 4 * time)) * 0.5; // Batida rápida
            break;
            
          case 'nostalgic1':
            // Tom melancólico
            value = Math.sin(2 * Math.PI * 294 * time) * 0.15 + // D4
                   Math.sin(2 * Math.PI * 349 * time) * 0.12 + // F4
                   Math.sin(2 * Math.PI * 440 * time) * 0.1;  // A4
            value *= Math.exp(-time * 0.1); // Fade out gradual
            break;
            
          case 'cinematic1':
            // Som épico cinematográfico
            value = Math.sin(2 * Math.PI * 110 * time) * 0.3 + // Bass
                   Math.sin(2 * Math.PI * 220 * time) * 0.2 +
                   Math.sin(2 * Math.PI * 440 * time) * 0.15;
            value *= (1 + Math.sin(2 * Math.PI * 0.25 * time)) * 0.5; // Crescendo lento
            break;
            
          default:
            value = 0;
        }
        
        channelData[i] = value * settings.musicVolume;
      }
    }
    
    return audioBuffer;
  };

  // Função para lidar com upload de arquivo de áudio
  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Verificar se é arquivo de áudio
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
    
    toast({
      title: 'Áudio carregado',
      description: `Arquivo "${file.name}" pronto para uso`,
      status: 'success',
      duration: 3000,
    });
  };

  // Função para configurar áudio para gravação
  const setupAudioForRecording = async (videoDuration) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      let audioSource;
      
      if (settings.musicSource === 'upload' && audioFile) {
        // Usar arquivo enviado pelo usuário
        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.loop = true; // Loop para cobrir todo o vídeo
      } else if (settings.musicSource === 'preset') {
        // Usar música preset gerada
        const audioBuffer = await generatePresetMusic(settings.selectedPresetMusic, videoDuration);
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.loop = true;
      } else {
        return null; // Sem áudio
      }
      
      // Configurar volume
      const gainNode = audioContext.createGain();
      gainNode.gain.value = settings.musicVolume;
      
      // Conectar áudio ao destino
      const destination = audioContext.createMediaStreamDestination();
      audioSource.connect(gainNode);
      gainNode.connect(destination);
      
      mediaStreamDestinationRef.current = destination;
      
      return { audioSource, audioStream: destination.stream };
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
        audioSetup = await setupAudioForRecording(totalVideoDuration);
      }
      
      // Configurar MediaRecorder com ou sem áudio
      let stream = canvas.captureStream(settings.fps);
      
      if (audioSetup && audioSetup.audioStream) {
        // Combinar vídeo e áudio
        const audioTracks = audioSetup.audioStream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        
        stream = new MediaStream([...videoTracks, ...audioTracks]);
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000, // 8 Mbps
      });

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
      
      mediaRecorder.start();
      
      // Iniciar áudio se configurado
      if (audioSetup && audioSetup.audioSource) {
        audioSetup.audioSource.start();
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
              
              // Aguardar próximo frame
              await new Promise(resolve => setTimeout(resolve, 1000 / settings.fps));
              
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
      mediaRecorder.stop();

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
          Gerador de Vídeo Timeline
        </Text>

        {/* Configurações */}
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Duração por foto (segundos)</FormLabel>
            <NumberInput
              value={settings.duration}
              onChange={(value) => setSettings({ ...settings, duration: Number(value) })}
              min={1}
              max={10}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Tipo de transição</FormLabel>
            <Select
              value={settings.transition}
              onChange={(e) => setSettings({ ...settings, transition: e.target.value })}
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="zoom">Zoom</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Resolução</FormLabel>
            <Select
              value={settings.resolution}
              onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
            >
              <option value="720p">720p (1280x720)</option>
              <option value="1080p">1080p (1920x1080)</option>
              <option value="1440p">1440p (2560x1440)</option>
            </Select>
          </FormControl>

          <HStack justify="space-between">
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Mostrar ano</FormLabel>
              <Switch
                isChecked={settings.showYearText}
                onChange={(e) => setSettings({ ...settings, showYearText: e.target.checked })}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Mostrar contador</FormLabel>
              <Switch
                isChecked={settings.showPhotoCount}
                onChange={(e) => setSettings({ ...settings, showPhotoCount: e.target.checked })}
              />
            </FormControl>
          </HStack>

          {/* Configurações de Áudio */}
          <Divider />
          
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" fontWeight="bold">Música de fundo</FormLabel>
            <Switch
              isChecked={settings.musicEnabled}
              onChange={(e) => setSettings({ ...settings, musicEnabled: e.target.checked })}
            />
          </FormControl>

          {settings.musicEnabled && (
            <VStack spacing={4} align="stretch" p={4} bg="gray.50" borderRadius="md">
              <FormControl>
                <FormLabel>Fonte da música</FormLabel>
                <Select
                  value={settings.musicSource}
                  onChange={(e) => setSettings({ ...settings, musicSource: e.target.value })}
                >
                  <option value="none">Sem música</option>
                  <option value="preset">Música pré-definida</option>
                  <option value="upload">Enviar arquivo próprio</option>
                </Select>
              </FormControl>

              {settings.musicSource === 'preset' && (
                <FormControl>
                  <FormLabel>Estilo musical</FormLabel>
                  <Select
                    value={settings.selectedPresetMusic}
                    onChange={(e) => setSettings({ ...settings, selectedPresetMusic: e.target.value })}
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
                  <FormLabel>Upload de arquivo de áudio</FormLabel>
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
                    colorScheme="blue"
                    variant="outline"
                    w="100%"
                  >
                    {audioFile ? `Arquivo: ${audioFile.name}` : 'Selecionar Arquivo de Áudio'}
                  </Button>
                  {audioFile && (
                    <Text fontSize="sm" color="green.500" mt={2}>
                      ✓ Arquivo carregado: {audioFile.name}
                    </Text>
                  )}
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Volume da música: {Math.round(settings.musicVolume * 100)}%</FormLabel>
                <Slider
                  value={settings.musicVolume}
                  onChange={(value) => setSettings({ ...settings, musicVolume: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  colorScheme="blue"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </FormControl>

              {/* Preview do áudio */}
              {audioUrl && (
                <Box>
                  <FormLabel>Preview do áudio</FormLabel>
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

        <Divider />

        {/* Canvas oculto para geração */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Progresso */}
        {isGenerating && (
          <VStack spacing={3}>
            <Text fontWeight="semibold">
              {progress === 100 ? 'Finalizando vídeo...' : `Gerando vídeo... ${progress}%`}
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
              <Text fontSize="sm" color="gray.500">
                Processando frames do vídeo timeline...
              </Text>
            )}
          </VStack>
        )}

        {/* Vídeo gerado */}
        {videoUrl && (
          <VStack spacing={3}>
            <Text color="green.500" fontWeight="bold">Vídeo gerado com sucesso!</Text>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
            />
          </VStack>
        )}

        {/* Botões */}
        <HStack spacing={4} justify="center">
          {!isGenerating && !videoUrl && (
            <Button
              leftIcon={<FaVideo />}
              colorScheme="blue"
              size="lg"
              onClick={generateVideo}
              isDisabled={!images || images.length === 0}
            >
              Gerar Vídeo ({images?.length || 0} fotos)
            </Button>
          )}

          {isGenerating && (
            <Button
              leftIcon={<FaStop />}
              colorScheme="red"
              size="lg"
              onClick={stopGeneration}
            >
              Parar Geração
            </Button>
          )}

          {videoUrl && (
            <Button
              leftIcon={<FaDownload />}
              colorScheme="green"
              size="lg"
              onClick={downloadVideo}
            >
              Download Vídeo
            </Button>
          )}

          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </HStack>

        {/* Informações */}
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            O vídeo será gerado inteiramente no seu navegador, sem enviar dados para nenhum servidor.
            O processo pode demorar alguns minutos dependendo da quantidade de fotos e configurações.
            {settings.musicEnabled && (
              <Box mt={2}>
                <Text fontWeight="semibold">🎵 Música de fundo habilitada:</Text>
                <Text fontSize="sm">
                  {settings.musicSource === 'preset' 
                    ? `Estilo: ${presetMusics[settings.selectedPresetMusic]?.name}` 
                    : settings.musicSource === 'upload' && audioFile
                    ? `Arquivo: ${audioFile.name}`
                    : 'Configuração de áudio pendente'
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
