import React, { useState, useRef, useCallback, useContext } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
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
    
    console.log('Arquivo selecionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
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
    
    // Validação adicional para MP3
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.mp3')) {
      toast({
        title: 'Formato não suportado',
        description: `Tipo: ${file.type}. Use MP3, WAV ou OGG para melhor compatibilidade.`,
        status: 'warning',
        duration: 5000,
      });
    }
    
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    // Detectar duração do áudio e testar decodificação
    try {
      console.log('Iniciando teste de decodificação...');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer criado para teste, tamanho:', arrayBuffer.byteLength);
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Teste de decodificação bem-sucedido:', {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels
      });
      
      const audioDuration = audioBuffer.duration;
      const videoDuration = images.length * settings.duration;
      
      let message = `Arquivo "${file.name}" carregado e validado! `;
      
      if (audioDuration < videoDuration) {
        message += `A música (${Math.round(audioDuration)}s) será repetida para cobrir todo o vídeo (${Math.round(videoDuration)}s).`;
      } else if (audioDuration > videoDuration) {
        message += `A música (${Math.round(audioDuration)}s) será cortada para corresponder ao vídeo (${Math.round(videoDuration)}s).`;
      } else {
        message += `Duração perfeita para o vídeo!`;
      }
      
      toast({
        title: 'Áudio carregado e testado',
        description: message,
        status: 'success',
        duration: 5000,
      });
      
      audioContext.close();
    } catch (error) {
      console.error('Erro ao analisar/decodificar áudio durante upload:', error);
      
      // Ainda permite o upload mas avisa sobre possível problema
      setAudioFile(null);
      setAudioUrl(null);
      
      toast({
        title: 'Erro ao processar áudio',
        description: `Não foi possível decodificar "${file.name}". Tente um arquivo MP3 diferente ou use WAV/OGG.`,
        status: 'error',
        duration: 7000,
      });
      return;
    }
  };

  // Função para configurar áudio para gravação
  const setupAudioForRecording = async (videoDuration, overrideAudioFile = null) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      let audioBuffer;
      
      const currentAudioFile = overrideAudioFile || audioFile;
      
      if (settings.musicSource === 'upload' && currentAudioFile) {
        console.log('Processando arquivo final:', currentAudioFile.name);
        console.log('Processando arquivo de upload:', {
          fileName: currentAudioFile.name,
          fileSize: currentAudioFile.size,
          fileType: currentAudioFile.type,
          lastModified: currentAudioFile.lastModified
        });
        
        // Método alternativo: usar elemento audio + MediaElementAudioSourceNode
        try {
          console.log('Tentando método Web Audio API...');
          const arrayBuffer = await currentAudioFile.arrayBuffer();
          console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
          
          const originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          console.log('Web Audio API funcionou! Áudio decodificado:', {
            duration: originalAudioBuffer.duration,
            sampleRate: originalAudioBuffer.sampleRate,
            channels: originalAudioBuffer.numberOfChannels,
            length: originalAudioBuffer.length
          });
          
          // Mover toda a lógica de processamento para dentro do try
          console.log('Áudio original:', {
            duration: originalAudioBuffer.duration,
            videoDuration: videoDuration,
            sampleRate: originalAudioBuffer.sampleRate,
            channels: originalAudioBuffer.numberOfChannels
          });
          
          // Ajustar duração do áudio para corresponder à duração do vídeo + margem de segurança
          const safetyMargin = 2; // 2 segundos extra para garantir que não falte áudio
          const targetDuration = videoDuration + safetyMargin;
          const targetLength = audioContext.sampleRate * targetDuration;
          const adjustedBuffer = audioContext.createBuffer(
            originalAudioBuffer.numberOfChannels,
            targetLength,
            audioContext.sampleRate
          );
          
          console.log('Durações calculadas:', {
            videoDurationOriginal: videoDuration,
            audioDurationWithMargin: targetDuration,
            originalAudioDuration: originalAudioBuffer.duration
          });
          
          for (let channel = 0; channel < originalAudioBuffer.numberOfChannels; channel++) {
            const sourceData = originalAudioBuffer.getChannelData(channel);
            const targetData = adjustedBuffer.getChannelData(channel);
            
            if (originalAudioBuffer.duration < targetDuration) {
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
            } else if (originalAudioBuffer.duration > targetDuration) {
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
          
        } catch (decodeError) {
          console.error('Web Audio API falhou:', decodeError);
          console.log('Tentando método alternativo com MediaElementAudioSourceNode...');
          
          // Método alternativo: usar o elemento audio que já funciona
          const audio = new Audio();
          audio.src = URL.createObjectURL(currentAudioFile);
          audio.crossOrigin = 'anonymous';
          audio.loop = true;
          
          // Aguardar o áudio carregar
          await new Promise((resolve, reject) => {
            audio.onloadedmetadata = resolve;
            audio.onerror = reject;
            audio.load();
          });
          
          console.log('Áudio carregado via elemento audio:', {
            duration: audio.duration,
            readyState: audio.readyState
          });
          
          // Criar fonte de áudio a partir do elemento
          const mediaElementSource = audioContext.createMediaElementSource(audio);
          
          // Configurar volume
          const gainNode = audioContext.createGain();
          gainNode.gain.value = settings.musicVolume;
          
          // Conectar ao destino
          const destination = audioContext.createMediaStreamDestination();
          mediaElementSource.connect(gainNode);
          gainNode.connect(destination);
          
          console.log('MediaElementAudioSourceNode configurado');
          
          return { 
            audioElement: audio, 
            audioStream: destination.stream, 
            audioContext,
            mediaElementSource,
            gainNode
          };
        }
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
    
    // Detectar se é formato vertical (Stories/Reels)
    const isVerticalFormat = height > width;
    
    // Calcular proporções para manter aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = width / height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (isVerticalFormat) {
      // Para formatos verticais, priorizar preenchimento da largura
      if (imgAspect > canvasAspect) {
        // Imagem mais larga que canvas - ajustar por altura para preencher melhor
        drawHeight = height;
        drawWidth = height * imgAspect;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Imagem mais alta - ajustar por largura
        drawWidth = width;
        drawHeight = width / imgAspect;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }
    } else {
      // Para formatos horizontais, manter lógica original
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
    const isVerticalFormat = height > width;
    
    ctx.save();
    
    // Configurar estilo do texto
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.textAlign = 'center';
    
    if (settings.showYearText) {
      // Ajustar tamanho da fonte baseado no formato
      const yearFontSize = isVerticalFormat ? 64 : 48;
      ctx.font = `bold ${yearFontSize}px Arial`;
      const yearText = year.toString();
      
      // Posicionar texto para formato vertical (mais espaço na parte inferior)
      const yearY = isVerticalFormat ? height - 150 : height - 100;
      ctx.strokeText(yearText, width / 2, yearY);
      ctx.fillText(yearText, width / 2, yearY);
    }
    
    if (settings.showPhotoCount) {
      // Ajustar tamanho da fonte baseado no formato
      const countFontSize = isVerticalFormat ? 32 : 24;
      ctx.font = `bold ${countFontSize}px Arial`;
      const countText = `${photoIndex + 1} / ${totalPhotos}`;
      
      // Posicionar contador para formato vertical
      const countY = isVerticalFormat ? height - 80 : height - 50;
      ctx.strokeText(countText, width / 2, countY);
      ctx.fillText(countText, width / 2, countY);
    }
    
    // Adicionar indicador de formato para Stories/Reels
    if (isVerticalFormat) {
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const formatText = width === 1080 && height === 1920 ? '📱 Stories' : 
                        width === 1080 && height === 1350 ? '📱 Reel' : '📱 Vertical';
      ctx.fillText(formatText, width / 2, 40);
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
        // Formatos verticais para Stories/Reels
        'stories-hd': { width: 1080, height: 1920 }, // 9:16 - Instagram Stories, TikTok
        'stories-4k': { width: 1440, height: 2560 }, // 9:16 - 4K vertical
        'reel-standard': { width: 1080, height: 1350 }, // 4:5 - Instagram Feed
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
        
        // Validação adicional com mais detalhes
        if (settings.musicSource === 'upload' && !audioFile) {
          console.error('Erro: musicSource é upload mas não há audioFile');
          console.log('Debug estado atual:', {
            musicSource: settings.musicSource,
            audioFile: audioFile,
            audioFileType: typeof audioFile,
            audioUrl: audioUrl,
            hasAudioUrl: !!audioUrl
          });
          
          // Tentar recuperar do estado do input
          const fileInput = document.getElementById('audio-upload');
          const inputFile = fileInput?.files?.[0];
          console.log('Tentando recuperar do input:', {
            hasInput: !!fileInput,
            hasFiles: !!fileInput?.files?.length,
            inputFile: inputFile?.name
          });
          
          if (inputFile) {
            console.log('Usando arquivo do input como fallback');
            // Usar o arquivo do input diretamente - criar nova variável local
            const recoveredAudioFile = inputFile;
            // Continuar com o processamento usando recoveredAudioFile
            audioSetup = await setupAudioForRecording(totalVideoDuration, recoveredAudioFile);
            console.log('Resultado setupAudioForRecording (com arquivo recuperado):', audioSetup);
            console.log('Áudio configurado:', !!audioSetup);
            
            if (audioSetup) {
              console.log('AudioSetup details:', {
                hasAudioSource: !!audioSetup.audioSource,
                hasAudioStream: !!audioSetup.audioStream,
                hasAudioContext: !!audioSetup.audioContext,
                hasAudioElement: !!audioSetup.audioElement,
                audioStreamTracks: audioSetup.audioStream?.getAudioTracks().length || 0
              });
            }
          } else {
            toast({
              title: 'Erro de configuração',
              description: 'Arquivo de áudio não encontrado. Selecione um arquivo primeiro.',
              status: 'error',
              duration: 5000,
            });
            setIsGenerating(false);
            return;
          }
        } else {
          // Caso normal - usar o audioFile do estado
          audioSetup = await setupAudioForRecording(totalVideoDuration);
          console.log('Resultado setupAudioForRecording:', audioSetup);
          console.log('Áudio configurado:', !!audioSetup);
          
          if (audioSetup) {
            console.log('AudioSetup details:', {
              hasAudioSource: !!audioSetup.audioSource,
              hasAudioStream: !!audioSetup.audioStream,
              hasAudioContext: !!audioSetup.audioContext,
              audioStreamTracks: audioSetup.audioStream?.getAudioTracks().length || 0
            });
          }
        }
      }
      
      // Configurar MediaRecorder com ou sem áudio
      let stream = canvas.captureStream(settings.fps);
      console.log('Stream inicial (apenas vídeo):', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      if (audioSetup && audioSetup.audioStream) {
        // Combinar vídeo e áudio
        const audioTracks = audioSetup.audioStream.getAudioTracks();
        const videoTracks = stream.getVideoTracks();
        
        console.log('Combinando streams:', {
          videoTracksCount: videoTracks.length,
          audioTracksCount: audioTracks.length,
          audioTrackState: audioTracks[0]?.readyState,
          audioTrackEnabled: audioTracks[0]?.enabled
        });
        
        stream = new MediaStream([...videoTracks, ...audioTracks]);
        
        console.log('Stream final (vídeo + áudio):', {
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length,
          totalTracks: stream.getTracks().length
        });
      }
      
      // Configurar MediaRecorder com suporte aprimorado para áudio
      let mediaRecorderOptions = {
        videoBitsPerSecond: 8000000, // 8 Mbps
      };
      
      // Tentar diferentes codecs para melhor compatibilidade de áudio
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mediaRecorderOptions.mimeType = 'video/webm;codecs=vp9,opus';
        console.log('Usando codec: vp9,opus');
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mediaRecorderOptions.mimeType = 'video/webm;codecs=vp8,opus';
        console.log('Usando codec: vp8,opus');
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mediaRecorderOptions.mimeType = 'video/webm';
        console.log('Usando codec: webm básico');
      }
      
      console.log('MediaRecorder options:', mediaRecorderOptions);
      console.log('Stream para MediaRecorder:', {
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
        videoTrackState: stream.getVideoTracks()[0]?.readyState,
        audioTrackState: stream.getAudioTracks()[0]?.readyState
      });
      
      const mediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
      console.log('MediaRecorder criado, state:', mediaRecorder.state);

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
      
      // Marcar tempo de início da geração
      const generationStartTime = Date.now();
      console.log('Iniciando geração em:', generationStartTime);
      
      // Iniciar gravação e áudio simultaneamente para melhor sincronização
      mediaRecorder.start();
      
      // Iniciar áudio se configurado - com timing preciso
      let audioStartTime = null;
      if (audioSetup) {
        try {
          if (audioSetup.audioSource) {
            // Método tradicional: BufferSource
            const contextStartTime = audioSetup.audioContext ? audioSetup.audioContext.currentTime + 0.1 : undefined;
            console.log('Iniciando audioSource (BufferSource) com startTime:', contextStartTime);
            audioSetup.audioSource.start(contextStartTime);
            audioStartTime = Date.now();
            console.log('AudioSource (BufferSource) iniciado com sucesso em:', audioStartTime);
          } else if (audioSetup.audioElement) {
            // Método alternativo: MediaElement
            console.log('Iniciando audioElement (MediaElement)...');
            audioSetup.audioElement.currentTime = 0;
            const playPromise = audioSetup.audioElement.play();
            if (playPromise) {
              await playPromise;
            }
            audioStartTime = Date.now();
            console.log('AudioElement (MediaElement) iniciado com sucesso em:', audioStartTime);
          }
        } catch (error) {
          console.error('Erro ao iniciar áudio:', error);
        }
      } else {
        console.log('Não há audioSetup para iniciar');
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
      
      const generationEndTime = Date.now();
      const totalGenerationTime = (generationEndTime - generationStartTime) / 1000; // em segundos
      console.log('Tempo total de geração:', totalGenerationTime, 'segundos');
      
      // Calcular quanto tempo o áudio deveria tocar baseado no tempo real de geração
      const expectedAudioDuration = Math.max(totalVideoDuration, totalGenerationTime);
      console.log('Duração esperada do áudio:', expectedAudioDuration, 'segundos');
      
      // Aguardar um pouco antes de parar para garantir que todos os frames foram processados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Parar o áudio se estiver rodando
      if (audioSetup) {
        try {
          if (audioSetup.audioSource) {
            console.log('Parando audioSource (BufferSource)...');
            audioSetup.audioSource.stop();
          } else if (audioSetup.audioElement) {
            console.log('Parando audioElement (MediaElement)...');
            audioSetup.audioElement.pause();
            audioSetup.audioElement.currentTime = 0;
          }
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
        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
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
            <FormLabel color={textColor}>Resolution & Format</FormLabel>
            <Select
              value={settings.resolution}
              onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
              bg={inputBg}
              color={textColor}
              borderColor={borderColor}
            >
              <optgroup label="📺 Horizontal (Landscape)">
                <option value="720p">720p (1280x720) - YouTube, Web</option>
                <option value="1080p">1080p (1920x1080) - Full HD</option>
                <option value="1440p">1440p (2560x1440) - 2K</option>
              </optgroup>
              <optgroup label="📱 Vertical (Stories/Reels)">
                <option value="stories-hd">Stories HD (1080x1920) - Instagram, TikTok</option>
                <option value="stories-4k">Stories 4K (1440x2560) - Premium Quality</option>
                <option value="reel-standard">Instagram Feed (1080x1350) - 4:5 Ratio</option>
              </optgroup>
            </Select>
          </FormControl>

          <Stack 
            direction={{ base: "column", sm: "row" }} 
            justify="space-between" 
            spacing={{ base: 3, sm: 0 }}
          >
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
          </Stack>

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
        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 3, sm: 4 }} 
          justify="center"
          align="center"
        >
          {!isGenerating && !videoUrl && (
            <Button
              leftIcon={<FaVideo />}
              colorScheme="blue"
              size={{ base: "md", md: "lg" }}
              onClick={generateVideo}
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

          {isGenerating && (
            <Button
              leftIcon={<FaStop />}
              colorScheme="red"
              size={{ base: "md", md: "lg" }}
              onClick={stopGeneration}
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
            >
              Stop Generation
            </Button>
          )}

          {videoUrl && (
            <Button
              leftIcon={<FaDownload />}
              colorScheme="green"
              size={{ base: "md", md: "lg" }}
              onClick={downloadVideo}
              w={{ base: "100%", sm: "auto" }}
              minW="200px"
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
            size={{ base: "md", md: "lg" }}
            w={{ base: "100%", sm: "auto" }}
            minW="120px"
          >
            Close
          </Button>
        </Stack>

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
            
            {/* Informações sobre formato do vídeo */}
            <Box mt={2}>
              <Text fontWeight="semibold">
                {['stories-hd', 'stories-4k', 'reel-standard'].includes(settings.resolution) 
                  ? '📱 Vertical Format (Stories/Reels)'
                  : '📺 Horizontal Format (Traditional)'
                }
              </Text>
              <Text fontSize="sm">
                {settings.resolution === 'stories-hd' && 'Perfect for Instagram Stories, TikTok, YouTube Shorts'}
                {settings.resolution === 'stories-4k' && 'High-quality vertical format for premium content'}
                {settings.resolution === 'reel-standard' && 'Optimized for Instagram Feed posts (4:5 ratio)'}
                {!['stories-hd', 'stories-4k', 'reel-standard'].includes(settings.resolution) && 
                  'Traditional landscape format for YouTube, web, and presentations'
                }
              </Text>
            </Box>
          </AlertDescription>
        </Alert>
      </VStack>
    </Box>
  );
};

export default TimelineVideoGenerator;
