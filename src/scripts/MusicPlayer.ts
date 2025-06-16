interface Track {
  path: string;
  title: string;
  artist: string;
  albumArt: string;
}

export class MusicPlayer {
  private button: HTMLButtonElement;
  private albumArtDiv: HTMLElement;
  private audio: HTMLAudioElement | null = null;
  private currentTrack: number;
  private isPlaying = false;
  private readonly tracks: Track[];

  private getRandomTrackIndex(): number {
    return Math.floor(Math.random() * this.tracks.length);
  }

  constructor() {
    const buttonEl = document.getElementById('music-toggle');
    const albumArtEl = document.getElementById('album-art');

    if (!buttonEl || !albumArtEl) {
      throw new Error('Required elements not found');
    }

    this.button = buttonEl as HTMLButtonElement;
    this.albumArtDiv = albumArtEl;

    // Initialize tracks with paths and album art
    this.tracks = [
      {
        path: '/music/flymetothemoon.mp3',
        albumArt: '/music/flymetothemoon.jpg',
        title: 'Fly Me to the Moon',
        artist: 'Frank Sinatra'
      },
      {
        path: '/music/Musicjust_the_two_of_us.mp3',
        albumArt: '/music/Musicjust_the_two_of_us.jpg',
        title: 'Just the Two of Us',
        artist: 'Bill Withers'
      },
      {
        path: '/music/what_a_wonderful_world.mp3',
        albumArt: '/music/what_a_wonderful_world.jpg',
        title: 'What a Wonderful World',
        artist: 'Louis Armstrong'
      }
    ];

    this.currentTrack = this.getRandomTrackIndex();
    this.setupEventListeners();
    this.initialize();
  }

  // Public methods for external access
  public getTracks(): Track[] {
    return [...this.tracks];
  }

  public async toggleMusic(): Promise<void> {
    try {
      if (!this.audio) {
        await this.loadAudio();
      }

      if (this.isPlaying) {
        this.pause();
      } else {
        await this.play();
      }
    } catch (error) {
      console.error('Error toggling music:', error);
    }
  }

  public async playTrack(index: number): Promise<void> {
    const track = this.tracks[index];
    if (!track) {
      throw new Error('Invalid track index');
    }

    this.currentTrack = index;
    this.updateAlbumArt(track.albumArt);
    await this.loadAudio();
    this.play().catch(console.error);
  }

  private setupEventListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.audio) {
        this.pause();
      }
      // Removed auto-resume when page becomes visible to prevent unwanted auto-play
    });
  }

  private async initialize() {
    try {
      const track = this.getCurrentTrack();
      this.updateAlbumArt(track.albumArt);
      // Only initialize the UI, don't auto-play music
    } catch (error) {
      console.error('Error initializing music player:', error);
    }
  }

  private updateAlbumArt(albumArt: string) {
    this.albumArtDiv.style.backgroundImage = `url(${albumArt})`;
    this.albumArtDiv.style.opacity = '1';
  }

  private getCurrentTrack(): Track {
    const track = this.tracks[this.currentTrack];
    if (!track) {
      throw new Error('Invalid track index');
    }
    return track;
  }

  private async loadAudio() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.addEventListener('ended', () => this.playNext());
    }

    const track = this.getCurrentTrack();
    this.audio.src = track.path;
    this.audio.preload = 'auto';

    try {
      await this.audio.load();
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  private async play() {
    if (this.audio) {
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.button.classList.add('spinning');
      } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
      }
    }
  }

  private pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.button.classList.remove('spinning');
    }
  }

  private async playNext() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    const track = this.getCurrentTrack();
    await this.playTrack(this.currentTrack);
  }
}