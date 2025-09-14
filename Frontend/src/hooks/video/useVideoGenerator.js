/**
 * Hook customizado para geração de vídeo timeline
 */

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { setupAudioForRecording } from '../../services/video/audioProcessor';
import { 
  loadImage, 
  getMediaRecorderOptions, 
  initializeFFmpeg, 
  convertWebMToMP4,
  addTextOverlay,
  getResolutionSettings,
  generateFileName,
  downloadBlob
} from '../../utils/video/videoUtils';
import { drawImageWithTransition, getDynamicTransition } from '../../utils/video/transitionEngine';

export const useVideoGenerator = () => {
  const toast = useToast();
  
  // Refs
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const ffmpegRef = useRef(null);
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [mp4VideoUrl, setMp4VideoUrl] = useState(null);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  
  /**
   * Carrega FFmpeg quando necessário
   */
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegRef.current || ffmpegLoaded) return;
    
    try {
      const ffmpeg = await initializeFFmpeg();
      ffmpegRef.current = ffmpeg;
      setFFmpegLoaded(true);
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      toast({
        title: 'Erro ao carregar conversor',
        description: 'Não foi possível carregar o conversor de vídeo. O download será feito em formato WebM.',
        status: 'warning',
        duration: 5000,
      });
    }
  }, [ffmpegLoaded, toast]);
  
  /**
   * Converte WebM para MP4
   */
  const convertToMP4 = useCallback(async (webmBlob) => {
    if (!ffmpegRef.current || !ffmpegLoaded) {
      console.log('FFmpeg not loaded, returning original WebM');
      return webmBlob;
    }

    try {
      setIsConverting(true);
      setConversionProgress(0);
      
      const mp4Blob = await convertWebMToMP4(
        webmBlob, 
        ffmpegRef.current, 
        setConversionProgress
      );
      
      setIsConverting(false);
      setConversionProgress(0);
      
      return mp4Blob;
    } catch (error) {
      console.error('Error converting video:', error);
      setIsConverting(false);
      setConversionProgress(0);
      
      toast({
        title: 'Erro na conversão',
        description: 'Não foi possível converter para MP4. O download será feito em WebM.',
        status: 'warning',
        duration: 5000,
      });
      
      return webmBlob;
    }
  }, [ffmpegLoaded, toast]);
  
  /**
   * Função principal para gerar o vídeo
   */
  const generateVideo = useCallback(async (images, settings, audioFile) => {
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
    setIsConverting(false);
    setConversionProgress(0);
    setMp4VideoUrl(null);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Configurar resolução
      const resolutions = getResolutionSettings();
      const resolution = resolutions[settings.resolution];
      canvas.width = resolution.width;
      canvas.height = resolution.height;

      // Calcular duração total do vídeo
      const totalVideoDuration = images.length * settings.duration;
      console.log('📊 Cálculo de duração:', {
        numberOfImages: images.length,
        durationPerImage: settings.duration,
        totalExpectedDuration: totalVideoDuration,
        fps: settings.fps
      });
      
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
        
        audioSetup = await setupAudioForRecording(audioFile, totalVideoDuration, settings);
        console.log('Áudio configurado:', !!audioSetup);
      }
      
      // Configurar MediaRecorder
      let stream = canvas.captureStream(settings.fps);
      
      if (audioSetup && audioSetup.audioStream) {
        const audioTracks = audioSetup.audioStream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        stream = new MediaStream([...videoTracks, ...audioTracks]);
      }
      
      const mediaRecorderOptions = getMediaRecorderOptions();
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('🎞️ MediaRecorder onstop chamado');
        console.log('📦 Chunks gravados:', recordedChunksRef.current.length);
        console.log('📏 Tamanho dos chunks:', recordedChunksRef.current.map(chunk => chunk.size));
        
        // Detectar o tipo de vídeo baseado no mimeType usado
        const isMP4 = mediaRecorderOptions.mimeType && mediaRecorderOptions.mimeType.includes('mp4');
        const videoType = isMP4 ? 'video/mp4' : 'video/webm';
        
        const videoBlob = new Blob(recordedChunksRef.current, { type: videoType });
        console.log(`🎥 ${isMP4 ? 'MP4' : 'WebM'} blob criado:`, {
          size: videoBlob.size,
          type: videoBlob.type,
          sizeInMB: (videoBlob.size / 1024 / 1024).toFixed(2) + ' MB'
        });
        
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);
        
        if (isMP4) {
          // Se já é MP4, usar diretamente
          setMp4VideoUrl(videoUrl);
          toast({
            title: 'Vídeo MP4 gerado com sucesso!',
            description: 'Seu vídeo timeline está pronto para download em formato MP4',
            status: 'success',
            duration: 5000,
          });
        } else {
          // Se é WebM, tentar converter para MP4
          try {
            // Carregar FFmpeg apenas se necessário
            if (!ffmpegLoaded) {
              console.log('🔄 Carregando FFmpeg para conversão...');
              await loadFFmpeg();
            }
            
            const mp4Blob = await convertToMP4(videoBlob);
            const mp4Url = URL.createObjectURL(mp4Blob);
            setMp4VideoUrl(mp4Url);
            
            toast({
              title: 'Vídeo gerado e convertido com sucesso!',
              description: 'Seu vídeo timeline está pronto para download em formato MP4',
              status: 'success',
              duration: 5000,
            });
          } catch (error) {
            console.error('Error in video conversion:', error);
            toast({
              title: 'Vídeo gerado com sucesso!',
              description: 'Vídeo pronto em formato WebM (conversão MP4 falhou)',
              status: 'success',
              duration: 5000,
            });
          }
        }
        
        setIsGenerating(false);
      };

      // Agrupar imagens por ano
      const imagesByYear = images.reduce((acc, img) => {
        if (!acc[img.year]) acc[img.year] = [];
        acc[img.year].push(img);
        return acc;
      }, {});

      const years = Object.keys(imagesByYear).sort((a, b) => Number(a) - Number(b));
      
      // Marcar tempo de início da geração
      const generationStartTime = Date.now();
      console.log('Iniciando geração em:', generationStartTime);
      
      // Iniciar gravação
      console.log('🎬 Iniciando gravação do MediaRecorder...');
      mediaRecorder.start();
      console.log('📹 MediaRecorder state after start:', mediaRecorder.state);
      
      // Iniciar áudio se configurado
      let audioStartTime = null;
      if (audioSetup) {
        try {
          if (audioSetup.audioSource) {
            const contextStartTime = audioSetup.audioContext ? audioSetup.audioContext.currentTime + 0.1 : undefined;
            console.log('Iniciando audioSource (BufferSource) com startTime:', contextStartTime);
            audioSetup.audioSource.start(contextStartTime);
            audioStartTime = Date.now();
            console.log('AudioSource (BufferSource) iniciado com sucesso em:', audioStartTime);
          }
        } catch (error) {
          console.error('Erro ao iniciar áudio:', error);
        }
      }

      // Calcular total de frames
      const framesPerImage = settings.duration * settings.fps;
      const totalFrames = images.length * framesPerImage;
      let currentFrame = 0;

      // Processar cada ano
      let globalImageIndex = 0;
      let previousYear = null;
      
      for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
        const year = years[yearIndex];
        const yearImages = imagesByYear[year];
        
        // Processar cada imagem do ano
        for (let imgIndex = 0; imgIndex < yearImages.length; imgIndex++) {
          const image = yearImages[imgIndex];
          
          try {
            const img = await loadImage(image.url);
            
            // Selecionar transição dinâmica para esta imagem
            const selectedTransition = getDynamicTransition(
              globalImageIndex, 
              images.length, 
              parseInt(year), 
              previousYear,
              settings.dynamicMode
            );
            
            // Animar a imagem com timing preciso
            const frameInterval = 1000 / settings.fps;
            
            for (let frame = 0; frame < framesPerImage; frame++) {
              const frameStartTime = Date.now();
              const transitionProgress = Math.min(frame / (settings.fps * settings.transitionDuration), 1);
              
              // Limpar canvas
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#000000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Desenhar imagem com transição
              drawImageWithTransition(
                ctx, 
                img, 
                canvas, 
                selectedTransition, 
                transitionProgress, 
                settings.enableParticles
              );
              
              // Adicionar texto overlay
              addTextOverlay(ctx, canvas, year, globalImageIndex, images.length, {
                showYearText: settings.showYearText,
                showPhotoCount: settings.showPhotoCount
              });
              
              // Aguardar apenas o necessário para manter sincronia
              await new Promise(resolve => requestAnimationFrame(resolve));
              
              // Atualizar progresso
              currentFrame++;
              const progressPercent = Math.min(Math.round((currentFrame / totalFrames) * 100), 100);
              setProgress(progressPercent);
            }
            
            // Atualizar índices
            globalImageIndex++;
            previousYear = parseInt(year);
            
          } catch (error) {
            console.error('Erro ao carregar imagem:', error);
            // Continuar com próxima imagem, mas ainda contar os frames
            currentFrame += framesPerImage;
            globalImageIndex++;
            previousYear = parseInt(year);
            const progressPercent = Math.min(Math.round((currentFrame / totalFrames) * 100), 100);
            setProgress(progressPercent);
          }
        }
      }

      // Finalizar gravação
      setProgress(100);
      
      const generationEndTime = Date.now();
      const totalGenerationTime = (generationEndTime - generationStartTime) / 1000;
      
      console.log('✅ Processamento completo:', {
        totalGenerationTime: totalGenerationTime,
        expectedDuration: totalVideoDuration,
        processedImages: globalImageIndex,
        totalFrames: totalFrames,
        processedFrames: currentFrame
      });
      
      // Aguardar finalização
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Parar o áudio
      if (audioSetup && audioSetup.audioSource) {
        try {
          console.log('Parando audioSource (BufferSource)...');
          audioSetup.audioSource.stop();
        } catch (error) {
          console.warn('Erro ao parar áudio:', error);
        }
      }
      
      // Parar a gravação
      console.log('🛑 Parando MediaRecorder...');
      mediaRecorder.stop();
      
      console.log('🎬 Gravação finalizada com áudio:', !!audioSetup);

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
  }, [toast, loadFFmpeg, ffmpegLoaded, convertToMP4]);
  
  /**
   * Função para fazer download do vídeo
   */
  const downloadVideo = useCallback(() => {
    const urlToDownload = mp4VideoUrl || videoUrl;
    const isMP4 = !!mp4VideoUrl;
    
    if (!urlToDownload) return;
    
    const filename = generateFileName(isMP4);
    
    // Criar blob a partir da URL e fazer download
    fetch(urlToDownload)
      .then(response => response.blob())
      .then(blob => {
        downloadBlob(blob, filename);
        
        toast({
          title: 'Download iniciado!',
          description: `Fazendo download do vídeo em formato ${isMP4 ? 'MP4' : 'WebM'}`,
          status: 'info',
          duration: 3000,
        });
      })
      .catch(error => {
        console.error('Erro no download:', error);
        toast({
          title: 'Erro no download',
          description: 'Não foi possível fazer o download do vídeo',
          status: 'error',
          duration: 3000,
        });
      });
  }, [mp4VideoUrl, videoUrl, toast]);
  
  /**
   * Para a geração do vídeo
   */
  const stopGeneration = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsGenerating(false);
  }, []);
  
  return {
    // Refs
    canvasRef,
    videoRef,
    
    // State
    isGenerating,
    progress,
    videoUrl,
    isConverting,
    conversionProgress,
    mp4VideoUrl,
    
    // Functions
    generateVideo,
    downloadVideo,
    stopGeneration,
  };
};
