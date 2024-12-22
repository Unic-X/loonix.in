document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const albumArt = document.getElementById('albumArt');
    const songTitle = document.getElementById('songTitle');
    const artistName = document.getElementById('artistName');
    const stationList = document.getElementById('stationList');

    let artist, title;

    const stations = [
        { url: 'https://stream.zeno.fm/shj04cslskxtv', station: 'Japanese' },
        { url: 'https://stream.zeno.fm/xwbmee4vufouv', station: 'Spotify' },
        { url: 'https://stream.zeno.fm/rmsvp9ef3bqtv', station: 'Personal' }
    ];

    let currentStationIndex = 1;
    let isPlaying = false;
    let eventSource;

    // Retrieve volume from localStorage or set default value
    const savedVolume = parseFloat(localStorage.getItem('radioVolume')) || 0.5;

    let radio = new Howl({
        src: [stations[currentStationIndex].url],
        html5: true,
        format: ['mp3', 'aac'],
        volume: savedVolume // Initialize with saved volume
    });

    volumeSlider.value = savedVolume; // Set slider to saved volume

    function togglePlayPause() {
        const playIcon = document.getElementById('playIcon');
        const pauseIcon = document.getElementById('pauseIcon');
    
        if (isPlaying) {
            radio.pause();
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
            albumArt.classList.remove('playing');
        } else {
            radio.play();
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            albumArt.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }

    function changeStation(index) {
        if (index === currentStationIndex) return;

        radio.unload();
        currentStationIndex = index;

        radio = new Howl({
            src: [stations[currentStationIndex].url],
            html5: true,
            format: ['mp3', 'aac'],
            volume: parseFloat(localStorage.getItem('radioVolume')) || 0.5 // Preserve volume on station change
        });

        if (isPlaying) {
            radio.play();
        }

        updateStationList();

        if (eventSource) {
            eventSource.close(); 
        }

        const metadataUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${stations[currentStationIndex].url.split('/').pop()}`;
        eventSource = new EventSource(metadataUrl);

        eventSource.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data && data.streamTitle) {
                    [artist, title] = data.streamTitle.split(' - ');
                    songTitle.textContent = title || 'Unknown';
                    artistName.textContent = artist || 'Unknown Artist';

                    if ('mediaSession' in navigator) {
                        console.log(`${artist}-${title}`)
                        navigator.mediaSession.metadata = new MediaMetadata({
                            title: title || "Loonix Radio",
                            artist: artist || "Unknown Artist",
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing metadata:', error);
            }
        });
    }

    function updateStationList() {
        Array.from(stationList.children).forEach((li, idx) => {
            li.classList.toggle('active', idx === currentStationIndex);
        });
    }

    const initialMetadataUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${stations[currentStationIndex].url.split('/').pop()}`;
    eventSource = new EventSource(initialMetadataUrl);

    eventSource.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.streamTitle) {
                [artist, title] = data.streamTitle.split(' - ');
                songTitle.textContent = title || 'Unknown';
                artistName.textContent = artist || 'Unknown Artist';
                if ('mediaSession' in navigator) {
                    console.log(`${artist}-${title}`)
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: title || "Loonix Radio",
                        artist: artist || "Unknown Artist",
                    });
                }
            }
        } catch (error) {
            console.error('Error parsing metadata:', error);
        }
    });

    playPauseBtn.addEventListener('click', togglePlayPause);

    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        radio.volume(volume);
        localStorage.setItem('radioVolume', volume); // Save volume to localStorage
    });

    stationList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            changeStation(parseInt(e.target.dataset.index));
        }
    });
});
