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
  useColorModeValue,
  Divider,
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
  });

  // Cores do tema
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

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

      // Configurar MediaRecorder
      const stream = canvas.captureStream(settings.fps);
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
          </AlertDescription>
        </Alert>
      </VStack>
    </Box>
  );
};

export default TimelineVideoGenerator;
