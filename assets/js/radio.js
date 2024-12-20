document.addEventListener("DOMContentLoaded", function () {
    const playPauseButton = document.getElementById("play-pause");
    const artistNameElem = document.getElementById("artist-name");
    const songTitleElem = document.getElementById("song-title");

    // Initialize the Howler.js player
    const radio = new Howl({
        src: ['https://stream.zeno.fm/shj04cslskxtv'], // Your Zeno.fm stream URL
        html5: true, 
        autoplay: false, 
        format: ['mp3'],
    });

    let isPlaying = false;

    // Play/Pause functionality
    playPauseButton.addEventListener("click", () => {
        if (!isPlaying) {
            radio.play();
            playPauseButton.textContent = "Pause";
            isPlaying = true;
        } else {
            radio.pause();
            playPauseButton.textContent = "Play";
            isPlaying = false;
        }
    });

    // Establish the EventSource connection for real-time metadata updates
    const metadataUrl = 'https://api.zeno.fm/mounts/metadata/subscribe/shj04cslskxtv';
    const eventSource = new EventSource(metadataUrl);

    eventSource.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data && data.streamTitle) {
                // Example response: "Artist - Song Title"
                const [artist, song] = data.streamTitle.split(" - ");

                artistNameElem.textContent = `Artist: ${artist || "Unknown"}`;
                songTitleElem.textContent = `Song: ${song || "Unknown"}`;

                // Update media session metadata (if supported)
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: song || "Unknown",
                        artist: artist || "Unknown",
                        artwork: [
                            { src: 'img/cover.png', sizes: '96x96', type: 'image/png' }, // Replace with actual artwork URL if available
                            { src: 'img/cover.png', sizes: '128x128', type: 'image/png' },
                            { src: 'img/cover.png', sizes: '192x192', type: 'image/png' },
                            { src: 'img/cover.png', sizes: '256x256', type: 'image/png' },
                            { src: 'img/cover.png', sizes: '384x384', type: 'image/png' },
                            { src: 'img/cover.png', sizes: '512x512', type: 'image/png' },
                        ],
                    });
                }
            } else {
                artistNameElem.textContent = "Artist: Unavailable";
                songTitleElem.textContent = "Song: Unavailable";
            }
        } catch (error) {
            console.error("Error parsing metadata:", error);
        }
    });

    eventSource.addEventListener("error", (error) => {
        console.error("Error with SSE connection:", error);
        artistNameElem.textContent = "Artist: Unavailable";
        songTitleElem.textContent = "Song: Unavailable";
    });
});
