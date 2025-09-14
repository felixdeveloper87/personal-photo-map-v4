/**
 * Utilitários para processamento de vídeo
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * Carrega uma imagem com CORS habilitado
 * @param {string} src - URL da imagem
 * @returns {Promise<HTMLImageElement>}
 */
export const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Configura opções do MediaRecorder para máxima compatibilidade
 * @param {number} videoBitsPerSecond - Taxa de bits do vídeo
 * @returns {Object} Opções do MediaRecorder
 */
export const getMediaRecorderOptions = (videoBitsPerSecond = 8000000) => {
  const options = {
    videoBitsPerSecond,
  };
  
  // Tentar codecs MP4 primeiro para compatibilidade móvel
  if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
    options.mimeType = 'video/mp4;codecs=h264,aac';
    console.log('✅ Usando codec MP4: h264,aac');
  } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
    options.mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
    console.log('✅ Usando codec MP4: avc1.42E01E,mp4a.40.2');
  } else if (MediaRecorder.isTypeSupported('video/mp4')) {
    options.mimeType = 'video/mp4';
    console.log('✅ Usando codec MP4 básico');
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    options.mimeType = 'video/webm;codecs=vp9,opus';
    console.log('⚠️ Fallback para WebM: vp9,opus');
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    options.mimeType = 'video/webm;codecs=vp8,opus';
    console.log('⚠️ Fallback para WebM: vp8,opus');
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    options.mimeType = 'video/webm';
    console.log('⚠️ Fallback para WebM básico');
  }
  
  return options;
};

/**
 * Inicializa FFmpeg para conversão de vídeo
 * @returns {Promise<FFmpeg>}
 */
export const initializeFFmpeg = async () => {
  const ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
  });
  
  console.log('FFmpeg loaded successfully');
  return ffmpeg;
};

/**
 * Converte WebM para MP4 usando FFmpeg
 * @param {Blob} webmBlob - Blob do vídeo WebM
 * @param {FFmpeg} ffmpeg - Instância do FFmpeg
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise<Blob>}
 */
export const convertWebMToMP4 = async (webmBlob, ffmpeg, onProgress) => {
  if (!ffmpeg) {
    console.log('FFmpeg not loaded, returning original WebM');
    return webmBlob;
  }

  try {
    console.log('📁 Escrevendo arquivo WebM para FFmpeg...');
    await ffmpeg.writeFile('input.webm', await fetchFile(webmBlob));
    console.log('✅ Arquivo WebM escrito com sucesso');
    
    // Set up progress tracking
    if (onProgress) {
      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.round(progress * 100);
        onProgress(percent);
        console.log('🔄 Progresso FFmpeg:', percent + '%');
      });
    }

    console.log('🎬 Iniciando conversão FFmpeg para MP4...');
    await ffmpeg.exec([
      '-i', 'input.webm',
      '-c:v', 'libx264',          // H.264 codec for maximum compatibility
      '-preset', 'medium',         // Balance between speed and compression
      '-crf', '23',               // Good quality setting
      '-c:a', 'aac',              // AAC audio codec
      '-b:a', '128k',             // Audio bitrate
      '-movflags', '+faststart',   // Optimize for web streaming
      '-pix_fmt', 'yuv420p',      // Pixel format compatible with older devices
      '-avoid_negative_ts', 'make_zero', // Evitar problemas de timestamp
      'output.mp4'
    ]);
    console.log('✅ Conversão FFmpeg concluída');

    // Read the converted file
    const mp4Data = await ffmpeg.readFile('output.mp4');
    const mp4Blob = new Blob([mp4Data], { type: 'video/mp4' });
    
    console.log('📊 Comparação de arquivos:', {
      webmSize: webmBlob.size,
      mp4Size: mp4Blob.size,
      webmSizeMB: (webmBlob.size / 1024 / 1024).toFixed(2) + ' MB',
      mp4SizeMB: (mp4Blob.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // Clean up
    await ffmpeg.deleteFile('input.webm');
    await ffmpeg.deleteFile('output.mp4');

    console.log('✅ Video converted to MP4 successfully');
    return mp4Blob;

  } catch (error) {
    console.error('Error converting video:', error);
    throw error;
  }
};

/**
 * Adiciona overlay de texto ao canvas
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {HTMLCanvasElement} canvas - Canvas
 * @param {string} year - Ano atual
 * @param {number} imageIndex - Índice da imagem atual
 * @param {number} totalImages - Total de imagens
 * @param {Object} settings - Configurações do texto
 */
export const addTextOverlay = (ctx, canvas, year, imageIndex, totalImages, settings = {}) => {
  const {
    showYearText = true,
    showPhotoCount = true,
    textColor = 'white',
    fontSize = 'auto',
    position = 'bottom-left'
  } = settings;
  
  ctx.save();
  
  // Determinar tamanho da fonte baseado no canvas
  const baseFontSize = fontSize === 'auto' ? Math.max(24, canvas.width / 50) : fontSize;
  const yearFontSize = baseFontSize * 1.2;
  const countFontSize = baseFontSize * 0.8;
  
  // Configurar sombra para melhor legibilidade
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Determinar posição base
  const margin = 20;
  let x, y;
  
  switch (position) {
    case 'top-left':
      x = margin;
      y = margin + yearFontSize;
      break;
    case 'top-right':
      x = canvas.width - margin;
      y = margin + yearFontSize;
      ctx.textAlign = 'right';
      break;
    case 'bottom-right':
      x = canvas.width - margin;
      y = canvas.height - margin;
      ctx.textAlign = 'right';
      break;
    case 'bottom-left':
    default:
      x = margin;
      y = canvas.height - margin;
      break;
  }
  
  // Desenhar ano
  if (showYearText) {
    ctx.font = `bold ${yearFontSize}px Arial`;
    ctx.fillStyle = textColor;
    ctx.fillText(year, x, y);
    
    if (position.includes('bottom')) {
      y -= yearFontSize + 10;
    } else {
      y += yearFontSize + 10;
    }
  }
  
  // Desenhar contador de fotos
  if (showPhotoCount) {
    ctx.font = `${countFontSize}px Arial`;
    ctx.fillStyle = textColor;
    const countText = `${imageIndex + 1} / ${totalImages}`;
    ctx.fillText(countText, x, y);
  }
  
  // Detectar formato vertical para adicionar indicador
  const isVerticalFormat = canvas.height > canvas.width;
  if (isVerticalFormat) {
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const formatText = canvas.width === 1080 && canvas.height === 1920 ? '📱 Stories' : 
                      canvas.width === 1080 && canvas.height === 1350 ? '📱 Reel' : '📱 Vertical';
    ctx.textAlign = 'center';
    ctx.fillText(formatText, canvas.width / 2, 40);
  }
  
  ctx.restore();
};

/**
 * Calcula configurações de resolução
 * @returns {Object} Configurações de resolução disponíveis
 */
export const getResolutionSettings = () => ({
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '1440p': { width: 2560, height: 1440 },
  // Formatos verticais para Stories/Reels
  'stories-hd': { width: 1080, height: 1920 }, // 9:16 - Instagram Stories, TikTok
  'stories-4k': { width: 1440, height: 2560 }, // 9:16 - 4K vertical
  'reel-standard': { width: 1080, height: 1350 }, // 4:5 - Instagram Feed
});

/**
 * Cria nome de arquivo para download
 * @param {boolean} isMP4 - Se é arquivo MP4
 * @returns {string} Nome do arquivo
 */
export const generateFileName = (isMP4) => {
  const timestamp = new Date().getTime();
  const extension = isMP4 ? 'mp4' : 'webm';
  return `timeline-video-${timestamp}.${extension}`;
};

/**
 * Faz download de um blob
 * @param {Blob} blob - Blob para download
 * @param {string} filename - Nome do arquivo
 */
export const downloadBlob = (blob, filename) => {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Liberar URL object
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
};
