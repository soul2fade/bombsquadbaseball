import { Audio, AVPlaybackSource } from 'expo-av';

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
  source: AVPlaybackSource;
  volume: number;
}

const SOUND_LIBRARY: Partial<Record<SoundKey, SoundEntry>> = {
  // Populate as audio files land in assets/sounds/. Until then trigger() no-ops.
};

class AudioServiceImpl {
  private masterVolume = 0.8;
  private activeAmbient: Audio.Sound | null = null;
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.initialized = true;
    } catch (e) {
      // Audio init can fail on web — degrade silently
      this.initialized = true;
    }
  }

  setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
  }

  async trigger(key: SoundKey) {
    const entry = SOUND_LIBRARY[key];
    if (!entry) return;
    try {
      const { sound } = await Audio.Sound.createAsync(entry.source, {
        volume: entry.volume * this.masterVolume,
      });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (e) {
      // Missing or unreadable audio file — silent fail keeps gameplay alive
    }
  }

  async playAmbient(source: AVPlaybackSource | undefined, volume = 0.6) {
    if (!source) return;
    await this.stopAmbient();
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        isLooping: true,
        volume: volume * this.masterVolume,
      });
      this.activeAmbient = sound;
      await sound.playAsync();
    } catch (e) {
      // ignore
    }
  }

  async stopAmbient() {
    if (!this.activeAmbient) return;
    try {
      await this.activeAmbient.stopAsync();
      await this.activeAmbient.unloadAsync();
    } catch (e) {
      // ignore
    }
    this.activeAmbient = null;
  }
}

export const audioService = new AudioServiceImpl();
