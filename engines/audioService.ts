import { createAudioPlayer, setAudioModeAsync, AudioSource, AudioPlayer } from 'expo-audio';

type SoundKey =
  | 'hit_normal'
  | 'hit_muffled'
  | 'hit_tailwind_hr'
  | 'wind_shift'
  | 'sandstorm_trigger'
  | 'crowd_cheer'
  | 'crowd_boo'
  | 'crowd_roar'
  | 'clutch_pitch'
  | 'heat_streak'
  | 'last_stand'
  | 'bases_loaded'
  | 'lights_flicker'
  | 'eruption_warning';

interface SoundEntry {
  source: AudioSource;
  volume: number;
}

const SOUND_LIBRARY: Partial<Record<SoundKey, SoundEntry>> = {
  // Populate as audio files land in assets/sounds/. Until then trigger() no-ops.
  // Example:
  // hit_normal: { source: require('../assets/sounds/hits/hit_normal.mp3'), volume: 1 },
};

class AudioServiceImpl {
  private masterVolume = 0.8;
  private ambient: AudioPlayer | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
      this.initialized = true;
    } catch {
      this.initialized = true;
    }
  }

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
  }

  trigger(key: SoundKey) {
    const entry = SOUND_LIBRARY[key];
    if (!entry) return;
    try {
      const player = createAudioPlayer(entry.source);
      player.volume = entry.volume * this.masterVolume;
      player.play();
      const sub = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          sub.remove();
          player.remove();
        }
      });
    } catch {
      // Missing or unreadable audio — silent fail keeps gameplay alive
    }
  }

  playAmbient(source: AudioSource | undefined, volume = 0.6) {
    if (!source) return;
    this.stopAmbient();
    try {
      const player = createAudioPlayer(source);
      player.volume = volume * this.masterVolume;
      player.loop = true;
      player.play();
      this.ambient = player;
    } catch {
      // ignore
    }
  }

  stopAmbient() {
    if (!this.ambient) return;
    try {
      this.ambient.pause();
      this.ambient.remove();
    } catch {
      // ignore
    }
    this.ambient = null;
  }
}

export const audioService = new AudioServiceImpl();
