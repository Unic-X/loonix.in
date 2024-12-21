document.addEventListener('DOMContentLoaded', () => {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const albumArt = document.getElementById('albumArt');
    const songTitle = document.getElementById('songTitle');
    const artistName = document.getElementById('artistName');

    const stations = [
        { url: 'https://stream.zeno.fm/shj04cslskxtv', name: 'Sexy Lounge' },
        { url: 'https://stream.zeno.fm/0r0xa792kwzuv', name: 'Smooth Jazz' },
        { url: 'https://stream.zeno.fm/6qx3pzm4v2zuv', name: 'Chill Out' }
    ];

    let currentStationIndex = 0;
    let isPlaying = false;

    const radio = new Howl({
        src: [stations[currentStationIndex].url],
        html5: true,
        format: ['mp3', 'aac']
    });

    function togglePlayPause() {
        if (isPlaying) {
            radio.pause();
            playPauseBtn.textContent = '▶';
            albumArt.classList.remove('playing');
        } else {
            radio.play();
            playPauseBtn.textContent = '⏸';
            albumArt.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }


    playPauseBtn.addEventListener('click', togglePlayPause);
    volumeSlider.addEventListener('input', (e) => {
        radio.volume(parseFloat(e.target.value));
    });

    // Metadata handling
    const metadataUrl = `https://api.zeno.fm/mounts/metadata/subscribe/${stations[currentStationIndex].url.split('/').pop()}`;
    const eventSource = new EventSource(metadataUrl);

    eventSource.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.streamTitle) {
                const [artist, title] = data.streamTitle.split(' - ');
                songTitle.textContent = title || 'Unknown';
                artistName.textContent = artist || 'Unknown Artist';
            }
        } catch (error) {
            console.error('Error parsing metadata:', error);
        }
    });

    eventSource.addEventListener('error', () => {
        songTitle.textContent = 'Metadata Unavailable';
        artistName.textContent = stations[currentStationIndex].name;
    });

    // Update album art periodically
    setInterval(() => {
        if (isPlaying) {
            albumArt.querySelector('img').src = `/cover.jpg`;
        }
    }, 30000);

    // Cleanup
    window.addEventListener('beforeunload', () => {
        eventSource.close();
        radio.unload();
    });
});