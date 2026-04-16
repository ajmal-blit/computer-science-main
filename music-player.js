/**
 * CS DEPARTMENT - MUSIC PLAYER LOGIC
 * Features: Play/Pause, Skip, Seek, Volume, Song List
 */

class MusicPlayer {
    constructor() {
        this.songs = [
            {
                title: "Arz Kiya Hai",
                artist: "By Anuv Jain",
                src: "assets/Arz_Kiya_Hai.mp3"
            },
            {
                title: "Channa Mereya",
                artist: "By Arijit Singh",
                src: "assets/Chenna Meriya By Arjit Singh.mp4"
            },
            {
                title: "Innalekalil",
                artist: "From Godha",
                src: "assets/Innalekalil From Godha.mp4"
            },
            {
                title: "Let Her Go X Husn",
                artist: "By Anuv Jain",
                src: "assets/Let Her Go  X Husn By Anuv Jain.mp4"
            },
            {
                title: "Maayajalame",
                artist: "From Sarvam Maya",
                src: "assets/Maayajalame From Sarvam Maya.mp4"
            },
            {
                title: "Naula Sawrat",
                artist: "By Garhwali Folk",
                src: "assets/naula sawrat.mp4"
            }
        ];

        this.currentIndex = 0;
        this.isPlaying = false;
        
        // DOM Elements
        this.audio = document.getElementById('mp-audio');
        this.playBtn = document.getElementById('mp-play');
        this.playIcon = document.getElementById('mp-play-icon');
        this.prevBtn = document.getElementById('mp-prev');
        this.nextBtn = document.getElementById('mp-next');
        this.seekSlider = document.getElementById('mp-seek');
        this.volSlider = document.getElementById('mp-volume');
        this.curTime = document.getElementById('mp-current');
        this.durTime = document.getElementById('mp-duration');
        this.songTitle = document.getElementById('mp-song-title');
        this.songArtist = document.getElementById('mp-song-artist');
        this.disc = document.getElementById('mp-disc');
        this.songListContainer = document.getElementById('mp-song-list');
        this.fab = document.getElementById('music-fab');
        this.panel = document.getElementById('music-panel');
        this.closeBtn = document.getElementById('mp-close-btn');

        this.init();
    }

    init() {
        this.renderSongs();
        this.loadSong(this.currentIndex);
        this.setupEventListeners();
    }

    renderSongs() {
        this.songListContainer.innerHTML = this.songs.map((song, idx) => `
            <div class="song-item ${idx === this.currentIndex ? 'active' : ''}" data-index="${idx}">
                <div class="song-item-idx">${(idx + 1).toString().padStart(2, '0')}</div>
                <div class="song-item-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
        `).join('');

        // Add clicks to song items
        this.songListContainer.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentIndex = parseInt(item.dataset.index);
                this.loadSong(this.currentIndex);
                this.playSong();
            });
        });
    }

    loadSong(index) {
        const song = this.songs[index];
        this.audio.src = song.src;
        this.songTitle.innerText = song.title;
        this.songArtist.innerText = song.artist;
        
        // Update active class in list
        this.songListContainer.querySelectorAll('.song-item').forEach((item, idx) => {
            item.classList.toggle('active', idx === index);
        });

        // Reset seek
        this.seekSlider.value = 0;
        this.curTime.innerText = "0:00";
    }

    playSong() {
        this.isPlaying = true;
        this.audio.play();
        this.playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // Pause icon
        this.disc.classList.add('playing');
    }

    pauseSong() {
        this.isPlaying = false;
        this.audio.pause();
        this.playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>'; // Play icon
        this.disc.classList.remove('playing');
    }

    togglePlay() {
        if (this.isPlaying) this.pauseSong();
        else this.playSong();
    }

    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) this.currentIndex = this.songs.length - 1;
        this.loadSong(this.currentIndex);
        this.playSong();
    }

    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) this.currentIndex = 0;
        this.loadSong(this.currentIndex);
        this.playSong();
    }

    setupEventListeners() {
        // Toggle Panel
        this.fab.addEventListener('click', () => {
            this.panel.classList.toggle('active');
        });

        this.closeBtn.addEventListener('click', () => {
            this.panel.classList.remove('active');
        });

        // Close on escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.panel.classList.remove('active');
        });

        // Close on click outside (improved UX)
        document.addEventListener('click', (e) => {
            if (this.panel.classList.contains('active') && 
                !this.panel.contains(e.target) && 
                !this.fab.contains(e.target)) {
                this.panel.classList.remove('active');
            }
        });

        // Controls
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prevSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());

        // Audio Events
        this.audio.addEventListener('timeupdate', () => {
            const { duration, currentTime } = this.audio;
            if (isNaN(duration)) return;
            
            const percent = (currentTime / duration) * 100;
            this.seekSlider.value = percent;

            // Format times
            this.curTime.innerText = this.formatTime(currentTime);
            this.durTime.innerText = this.formatTime(duration);
        });

        this.audio.addEventListener('ended', () => this.nextSong());

        // Seek Slider
        this.seekSlider.addEventListener('input', () => {
            const time = (this.seekSlider.value / 100) * this.audio.duration;
            this.audio.currentTime = time;
        });

        // Volume
        this.volSlider.addEventListener('input', () => {
            this.audio.volume = this.volSlider.value;
        });

        // Global spacebar to play/pause (improved check)
        window.addEventListener('keydown', (e) => {
            const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
            if (e.code === 'Space' && !isInput) {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserReg = localStorage.getItem("loggedUserReg");
    const musicFab = document.getElementById('music-fab');

    // Only show and initialize for user GVAZSCS002
    if (musicFab && loggedInUserReg === "GVAZSCS002") {
        musicFab.style.display = 'flex';
        window.csPlayer = new MusicPlayer();
    }
});
