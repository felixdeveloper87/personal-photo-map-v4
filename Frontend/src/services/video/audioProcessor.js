/**
 * Serviço para processamento de áudio no gerador de vídeo timeline
 */

// Preset music (generated using Web Audio API)
export const presetMusics = {
  ambient1: { name: 'Calm Ambient', description: 'Relaxing tone for memories' },
  upbeat1: { name: 'Energetic', description: 'Animated rhythm for adventures' },
  nostalgic1: { name: 'Nostalgic', description: 'Melancholic for special moments' },
  cinematic1: { name: 'Cinematic', description: 'Epic for great moments' },
};

/**
 * Gera música preset usando Web Audio API
 * @param {string} musicType - Tipo de música (ambient1, upbeat1, etc.)
 * @param {number} durationSeconds - Duração em segundos
 * @returns {Promise<AudioBuffer>}
 */
export const generatePresetMusic = async (musicType, durationSeconds) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const sampleRate = audioContext.sampleRate;
  const numberOfChannels = 2;
  const length = sampleRate * durationSeconds;
  
  const audioBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);
  
  for (let channel = 0; channel < numberOfChannels; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      const time = i / sampleRate;
      let sample = 0;
      
      switch (musicType) {
        case 'ambient1':
          // Tom relaxante com harmonias suaves
          sample = Math.sin(2 * Math.PI * 220 * time) * 0.1 * Math.sin(2 * Math.PI * 0.5 * time) +
                   Math.sin(2 * Math.PI * 330 * time) * 0.05 * Math.sin(2 * Math.PI * 0.3 * time) +
                   Math.sin(2 * Math.PI * 440 * time) * 0.03 * Math.sin(2 * Math.PI * 0.7 * time);
          break;
          
        case 'upbeat1':
          // Ritmo energético com batida
          const beat = Math.floor(time * 2) % 2 === 0 ? 1 : 0.3;
          sample = Math.sin(2 * Math.PI * 440 * time) * 0.15 * beat +
                   Math.sin(2 * Math.PI * 880 * time) * 0.1 * Math.sin(2 * Math.PI * 4 * time);
          break;
          
        case 'nostalgic1':
          // Tom melancólico com progressão lenta
          sample = Math.sin(2 * Math.PI * 293.66 * time) * 0.12 * Math.sin(2 * Math.PI * 0.2 * time) +
                   Math.sin(2 * Math.PI * 349.23 * time) * 0.08 * Math.sin(2 * Math.PI * 0.15 * time);
          break;
          
        case 'cinematic1':
          // Tom épico com crescendo
          const intensity = Math.min(time / (durationSeconds * 0.7), 1);
          sample = Math.sin(2 * Math.PI * 174.61 * time) * 0.2 * intensity +
                   Math.sin(2 * Math.PI * 261.63 * time) * 0.15 * intensity +
                   Math.sin(2 * Math.PI * 392 * time) * 0.1 * intensity;
          break;
          
        default:
          sample = Math.sin(2 * Math.PI * 440 * time) * 0.1;
      }
      
      // Aplicar envelope para evitar cliques no início/fim
      const fadeTime = 0.1; // 100ms de fade
      if (time < fadeTime) {
        sample *= time / fadeTime;
      } else if (time > durationSeconds - fadeTime) {
        sample *= (durationSeconds - time) / fadeTime;
      }
      
      channelData[i] = sample;
    }
  }
  
  return audioBuffer;
};

/**
 * Configura áudio para gravação com MediaRecorder
 * @param {File|null} audioFile - Arquivo de áudio carregado
 * @param {number} videoDuration - Duração do vídeo em segundos
 * @param {Object} settings - Configurações de áudio
 * @returns {Promise<Object|null>}
 */
export const setupAudioForRecording = async (audioFile, videoDuration, settings) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer;
    
    if (settings.musicSource === 'upload' && audioFile) {
      // Processar arquivo carregado
      console.log('Processando arquivo de upload:', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        lastModified: audioFile.lastModified
      });
      
      const arrayBuffer = await audioFile.arrayBuffer();
      console.log('ArrayBuffer criado, tamanho:', arrayBuffer.byteLength);
      
      const originalAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      console.log('Web Audio API funcionou! Áudio decodificado:', {
        duration: originalAudioBuffer.duration,
        sampleRate: originalAudioBuffer.sampleRate,
        channels: originalAudioBuffer.numberOfChannels,
        length: originalAudioBuffer.length
      });
      
      // Ajustar duração do áudio para terminar 0.1s antes do vídeo
      const audioEndOffset = 0.1; // Áudio termina 0.1s antes do vídeo
      const targetDuration = videoDuration - audioEndOffset;
      const targetLength = audioContext.sampleRate * targetDuration;
      const adjustedBuffer = audioContext.createBuffer(
        originalAudioBuffer.numberOfChannels,
        targetLength,
        audioContext.sampleRate
      );
      
      console.log('Durações calculadas:', {
        videoDurationOriginal: videoDuration,
        audioTargetDuration: targetDuration,
        audioEndOffset: audioEndOffset,
        originalAudioDuration: originalAudioBuffer.duration
      });
      
      for (let channel = 0; channel < originalAudioBuffer.numberOfChannels; channel++) {
        const originalData = originalAudioBuffer.getChannelData(channel);
        const adjustedData = adjustedBuffer.getChannelData(channel);
        
        if (originalAudioBuffer.duration >= targetDuration) {
          // Áudio mais longo que necessário - cortar para terminar 0.1s antes do vídeo
          console.log('Áudio mais longo que necessário - cortando para terminar 0.1s antes do vídeo...');
          for (let i = 0; i < targetLength; i++) {
            adjustedData[i] = originalData[i] || 0;
          }
        } else {
          // Áudio mais curto que necessário - repetir até terminar 0.1s antes do vídeo
          console.log('Áudio mais curto que necessário - repetindo até terminar 0.1s antes do vídeo...');
          for (let i = 0; i < targetLength; i++) {
            const sourceIndex = i % originalData.length;
            adjustedData[i] = originalData[sourceIndex];
          }
        }
      }
      
      audioBuffer = adjustedBuffer;
      
    } else if (settings.musicSource === 'preset') {
      // Gerar música preset
      console.log('Gerando música preset:', settings.selectedPresetMusic);
      const audioEndOffset = 0.1; // Áudio termina 0.1s antes do vídeo
      const targetDuration = videoDuration - audioEndOffset;
      audioBuffer = await generatePresetMusic(settings.selectedPresetMusic, targetDuration);
    } else {
      console.log('Nenhuma fonte de áudio configurada');
      return null;
    }
    
    // Criar source e destination
    const audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    
    // Controle de volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = settings.musicVolume || 0.5;
    
    // Criar destination para stream
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    
    // Conectar: source -> gain -> destination
    audioSource.connect(gainNode);
    gainNode.connect(mediaStreamDestination);
    
    console.log('Áudio conectado:', {
      bufferDuration: audioBuffer.duration,
      videoDuration: videoDuration,
      audioEndOffset: 0.1,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      streamTracks: mediaStreamDestination.stream.getAudioTracks().length
    });
    
    return {
      audioSource,
      audioStream: mediaStreamDestination.stream,
      audioContext,
      gainNode
    };
    
  } catch (error) {
    console.error('Erro ao configurar áudio:', error);
    throw error;
  }
};
