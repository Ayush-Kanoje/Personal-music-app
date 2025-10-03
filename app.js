document.addEventListener('DOMContentLoaded', () => {
            // --- CONFIGURATION ---
            const YOUTUBE_API_KEY = 'AIzaSyBdsMMt_VBBMjB_jX8_P4aYIDbJmtORdDM';
            const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

            // --- MOCK DATA ---
            const songs = [
                { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: 200, isFavorite: true, cover: 'https://placehold.co/100x100/1f1f1f/1DB954?text=BL', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', youtubeId: null },
                { id: 2, title: 'Shape of You', artist: 'Ed Sheeran', duration: 233, isFavorite: false, cover: 'https://placehold.co/100x100/1f1f1f/ffffff?text=SY', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', youtubeId: null },
                { id: 3, title: 'Someone You Loved', artist: 'Lewis Capaldi', duration: 182, isFavorite: true, cover: 'https://placehold.co/100x100/1f1f1f/1DB954?text=SYL', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', youtubeId: null },
                { id: 4, title: 'Dance Monkey', artist: 'Tones and I', duration: 209, isFavorite: false, cover: 'https://placehold.co/100x100/1f1f1f/ffffff?text=DM', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', youtubeId: null },
                { id: 5, title: 'Rockstar', artist: 'Post Malone', duration: 218, isFavorite: true, cover: 'https://placehold.co/100x100/1f1f1f/1DB954?text=R', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', youtubeId: null },
                { id: 6, title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', duration: 270, isFavorite: false, cover: 'https://placehold.co/100x100/1f1f1f/ffffff?text=UF', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', youtubeId: null },
                { id: 7, title: 'Closer', artist: 'The Chainsmokers', duration: 244, isFavorite: true, cover: 'https://placehold.co/100x100/1f1f1f/1DB954?text=C', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', youtubeId: null },
                { id: 8, title: 'Thinking Out Loud', artist: 'Ed Sheeran', duration: 281, isFavorite: false, cover: 'https://placehold.co/100x100/1f1f1f/ffffff?text=TOL', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', youtubeId: null }
            ];

            const playlists = [
                { id: 1, name: 'Chill Vibes', cover: 'https://placehold.co/200x200/4a044e/a5b4fc?text=Chill' },
                { id: 2, name: 'Workout Hits', cover: 'https://placehold.co/200x200/7f1d1d/fca5a5?text=Workout' },
                { id: 3, name: 'Indie Mix', cover: 'https://placehold.co/200x200/064e3b/6ee7b7?text=Indie' },
                { id: 4, name: 'Road Trip', cover: 'https://placehold.co/200x200/7c2d12/fdba74?text=Trip' }
            ];

            // --- STATE ---
            let currentSongIndex = 0;
            let isPlaying = false;
            let isShuffle = false;
            let isRepeat = false;
            let searchTimeout;
            let youtubeSearchResults = [];
            const audio = new Audio();

            // --- DOM ELEMENTS ---
            const screens = document.querySelectorAll('main');
            const navButtons = document.querySelectorAll('.nav-btn');
            const playerScreen = document.getElementById('player-screen');
            const closePlayerBtn = document.getElementById('close-player-btn');
            const playPauseBtn = document.getElementById('play-pause-btn');
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            const shuffleBtn = document.getElementById('shuffle-btn');
            const repeatBtn = document.getElementById('repeat-btn');
            const progressSlider = document.getElementById('progress-slider');
            const searchInput = document.getElementById('search-input');
            const searchResultsSection = document.getElementById('search-results-section');
            const searchResultsList = document.getElementById('search-results-list');

            // --- ICONS ---
            const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.188v3.624a1 1 0 001.555.816l3.066-1.812a1 1 0 000-1.632L9.555 7.168z" clip-rule="evenodd" /></svg>`;
            const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>`;
            
            // --- YOUTUBE API FUNCTIONS ---
            async function searchYouTubeVideos(query, maxResults = 6) {
                try {
                    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&maxResults=${maxResults}`;
                    
                    const response = await fetch(searchUrl);
                    
                    if (!response.ok) {
                        throw new Error(`YouTube API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    return data.items.map(item => ({
                        id: Date.now() + Math.random(),
                        youtubeId: item.id.videoId,
                        title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                        artist: item.snippet.channelTitle,
                        duration: null, // We'll fetch this separately if needed
                        cover: item.snippet.thumbnails.medium.url,
                        src: null, // YouTube videos can't be directly played due to CORS
                        isFavorite: false,
                        isYouTube: true
                    }));
                } catch (error) {
                    console.error('YouTube API search error:', error);
                    return [];
                }
            }

            async function getYouTubeVideoDuration(videoId) {
                try {
                    const videoUrl = `${YOUTUBE_API_BASE_URL}/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
                    const response = await fetch(videoUrl);
                    
                    if (!response.ok) {
                        throw new Error(`YouTube API error: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.items && data.items.length > 0) {
                        const duration = data.items[0].contentDetails.duration;
                        return parseYouTubeDuration(duration);
                    }
                    
                    return 0;
                } catch (error) {
                    console.error('Error fetching video duration:', error);
                    return 0;
                }
            }

            function parseYouTubeDuration(duration) {
                // Parse YouTube duration format (PT4M20S) to seconds
                const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                if (!match) return 0;
                
                const hours = parseInt(match[1] || 0);
                const minutes = parseInt(match[2] || 0);
                const seconds = parseInt(match[3] || 0);
                
                return hours * 3600 + minutes * 60 + seconds;
            }
            
            // --- RENDER FUNCTIONS ---
            function renderSavedMusic() {
                const listEl = document.getElementById('saved-music-list');
                listEl.innerHTML = '';
                songs.forEach((song, index) => {
                    const songEl = document.createElement('div');
                    songEl.className = 'flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer';
                    songEl.innerHTML = `
                        <img src="${song.cover}" alt="${song.title}" class="w-12 h-12 rounded-md">
                        <div class="flex-1">
                            <p class="font-semibold">${song.title}</p>
                            <p class="text-sm text-gray-400">${song.artist}</p>
                        </div>
                        <button class="play-song-btn p-2 rounded-full hover:bg-gray-700">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.188v3.624a1 1 0 001.555.816l3.066-1.812a1 1 0 000-1.632L9.555 7.168z" clip-rule="evenodd" /></svg>
                        </button>
                    `;
                    songEl.addEventListener('click', () => {
                        loadSong(index);
                        playSong();
                        openPlayer();
                    });
                    listEl.appendChild(songEl);
                });
            }

            function renderFavorites() {
                const gridEl = document.getElementById('favorites-grid');
                gridEl.innerHTML = '';
                songs.filter(s => s.isFavorite).forEach(song => {
                    const favEl = document.createElement('div');
                    favEl.className = 'flex flex-col items-center text-center cursor-pointer group';
                    favEl.innerHTML = `
                        <div class="relative">
                            <img src="${song.cover}" alt="${song.title}" class="w-full aspect-square rounded-lg shadow-md">
                            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.188v3.624a1 1 0 001.555.816l3.066-1.812a1 1 0 000-1.632L9.555 7.168z" clip-rule="evenodd" /></svg>
                            </div>
                        </div>
                        <p class="font-medium mt-2 truncate w-full">${song.title}</p>
                        <p class="text-xs text-gray-400">${song.artist}</p>
                    `;
                    gridEl.appendChild(favEl);
                });
            }

            function renderPlaylists() {
                const gridEl = document.getElementById('playlists-grid');
                gridEl.innerHTML = '';
                playlists.forEach(playlist => {
                    const playlistEl = document.createElement('div');
                    playlistEl.className = 'cursor-pointer';
                    playlistEl.innerHTML = `
                        <img src="${playlist.cover}" alt="${playlist.name}" class="w-full aspect-square rounded-lg shadow-md">
                        <p class="font-medium mt-2">${playlist.name}</p>
                    `;
                    gridEl.appendChild(playlistEl);
                });
            }
            
            // --- NAVIGATION ---
            navButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTab = btn.dataset.tab;

                    // Update button styles
                    navButtons.forEach(b => b.classList.replace('text-green-500', 'text-gray-400'));
                    btn.classList.replace('text-gray-400', 'text-green-500');

                    // Switch screens
                    screens.forEach(screen => {
                        if (screen.id === targetTab) {
                            screen.classList.remove('hidden');
                        } else {
                            screen.classList.add('hidden');
                        }
                    });
                });
            });

            // --- PLAYER LOGIC ---
            function loadSong(index, isYouTubeResult = false) {
                if (isYouTubeResult) {
                    // Handle YouTube search result
                    const song = youtubeSearchResults[index];
                    currentSongIndex = index;
                    
                    // Update player UI
                    document.getElementById('player-album-art').src = song.cover;
                    document.getElementById('player-song-title').innerText = song.title;
                    document.getElementById('player-artist-name').innerText = song.artist;
                    
                    // Note: Direct YouTube audio playback is not possible due to CORS restrictions
                    // You would need a YouTube API service or third-party service to get audio URLs
                    alert('YouTube playback requires additional setup for audio streaming. This is a demo showing YouTube search integration.');
                    return;
                } else {
                    currentSongIndex = index;
                    const song = songs[currentSongIndex];
                    audio.src = song.src;
                    
                    // Update player UI
                    document.getElementById('player-album-art').src = song.cover.replace('100x100', '500x500');
                    document.getElementById('player-song-title').innerText = song.title;
                    document.getElementById('player-artist-name').innerText = song.artist;
                    document.getElementById('total-duration').innerText = formatTime(song.duration);
                }
            }

            function playSong() {
                isPlaying = true;
                audio.play();
                playPauseBtn.innerHTML = pauseIcon;
            }

            function pauseSong() {
                isPlaying = false;
                audio.pause();
                playPauseBtn.innerHTML = playIcon;
            }

            function togglePlayPause() {
                if (isPlaying) {
                    pauseSong();
                } else {
                    playSong();
                }
            }
            
            function nextSong() {
                if (isShuffle) {
                    currentSongIndex = Math.floor(Math.random() * songs.length);
                } else {
                    currentSongIndex = (currentSongIndex + 1) % songs.length;
                }
                loadSong(currentSongIndex);
                playSong();
            }

            function prevSong() {
                currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
                loadSong(currentSongIndex);
                playSong();
            }

            function updateProgress() {
                const { duration, currentTime } = audio;
                const progressPercent = (currentTime / duration) * 100;
                progressSlider.value = isNaN(progressPercent) ? 0 : progressPercent;
                document.getElementById('current-time').textContent = formatTime(currentTime);
                if(duration) {
                     document.getElementById('total-duration').textContent = formatTime(duration);
                }
            }
            
            function setProgress(e) {
                const width = this.clientWidth;
                const clickX = e.offsetX;
                const duration = audio.duration;
                audio.currentTime = (clickX / width) * duration;
            }

            function formatTime(seconds) {
                if (isNaN(seconds)) return '0:00';
                const minutes = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
            }

            // --- PLAYER UI ---
            function openPlayer() {
                playerScreen.classList.remove('translate-y-full');
            }

            function closePlayer() {
                playerScreen.classList.add('translate-y-full');
            }
            
            // --- SEARCH LOGIC ---
            function renderSearchResults(results, isYouTubeResults = false) {
                searchResultsList.innerHTML = '';
                if (results.length === 0) {
                    searchResultsList.innerHTML = `<p class="text-gray-400">No results found.</p>`;
                    return;
                }

                results.forEach((song, index) => {
                    const songEl = document.createElement('div');
                    songEl.className = 'flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer';
                    
                    const youtubeIcon = isYouTubeResults ? `
                        <svg class="w-4 h-4 text-red-500 ml-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                    ` : '';
                    
                    songEl.innerHTML = `
                        <img src="${song.cover}" alt="${song.title}" class="w-12 h-12 rounded-md">
                        <div class="flex-1">
                            <div class="flex items-center">
                                <p class="font-semibold truncate">${song.title}</p>
                                ${youtubeIcon}
                            </div>
                            <p class="text-sm text-gray-400 truncate">${song.artist}</p>
                        </div>
                         <button class="play-song-btn p-2 rounded-full hover:bg-gray-700">
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.188v3.624a1 1 0 001.555.816l3.066-1.812a1 1 0 000-1.632L9.555 7.168z" clip-rule="evenodd" /></svg>
                        </button>
                    `;
                    songEl.addEventListener('click', () => {
                        if (isYouTubeResults) {
                            loadSong(index, true);
                            openPlayer();
                        } else {
                            const originalIndex = songs.findIndex(s => s.id === song.id);
                            if (originalIndex !== -1) {
                                loadSong(originalIndex);
                                playSong();
                                openPlayer();
                            }
                        }
                    });
                    searchResultsList.appendChild(songEl);
                });
            }

            async function searchSongs(query) {
                try {
                    // First search local songs
                    const localResults = [];
                    if (query) {
                        const lowerCaseQuery = query.toLowerCase();
                        localResults.push(...songs.filter(song => 
                            song.title.toLowerCase().includes(lowerCaseQuery) || 
                            song.artist.toLowerCase().includes(lowerCaseQuery)
                        ));
                    }

                    // Then search YouTube
                    const youtubeResults = await searchYouTubeVideos(query);
                    youtubeSearchResults = youtubeResults;

                    // Combine results (show local first, then YouTube)
                    return [...localResults, ...youtubeResults];
                } catch (error) {
                    console.error('Search error:', error);
                    // Fallback to local search only
                    if (!query) return [];
                    const lowerCaseQuery = query.toLowerCase();
                    return songs.filter(song => 
                        song.title.toLowerCase().includes(lowerCaseQuery) || 
                        song.artist.toLowerCase().includes(lowerCaseQuery)
                    );
                }
            }

            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value;

                if (!query) {
                    searchResultsSection.classList.add('hidden');
                    return;
                }
                
                searchResultsSection.classList.remove('hidden');
                searchResultsList.innerHTML = `<div class="flex justify-center items-center p-4"><span class="loader"></span></div>`;

                searchTimeout = setTimeout(async () => {
                    const results = await searchSongs(query);
                    const localResults = results.filter(r => !r.isYouTube);
                    const youtubeResults = results.filter(r => r.isYouTube);
                    
                    // Render local results first, then YouTube results
                    searchResultsList.innerHTML = '';
                    
                    if (localResults.length > 0) {
                        const localHeader = document.createElement('h3');
                        localHeader.className = 'text-lg font-semibold text-green-500 mb-2 mt-4';
                        localHeader.textContent = 'Local Music';
                        searchResultsList.appendChild(localHeader);
                        
                        localResults.forEach((song, index) => {
                            renderSingleSearchResult(song, index, false);
                        });
                    }
                    
                    if (youtubeResults.length > 0) {
                        const youtubeHeader = document.createElement('h3');
                        youtubeHeader.className = 'text-lg font-semibold text-red-500 mb-2 mt-6';
                        youtubeHeader.textContent = 'YouTube Results';
                        searchResultsList.appendChild(youtubeHeader);
                        
                        youtubeResults.forEach((song, index) => {
                            renderSingleSearchResult(song, index, true);
                        });
                    }
                    
                    if (results.length === 0) {
                        searchResultsList.innerHTML = `<p class="text-gray-400">No results found.</p>`;
                    }
                }, 500); // Increased debounce for API calls
            });

            function renderSingleSearchResult(song, index, isYouTubeResult) {
                const songEl = document.createElement('div');
                songEl.className = 'flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer mb-2';
                
                const youtubeIcon = isYouTubeResult ? `
                    <svg class="w-4 h-4 text-red-500 ml-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                ` : '';
                
                songEl.innerHTML = `
                    <img src="${song.cover}" alt="${song.title}" class="w-12 h-12 rounded-md">
                    <div class="flex-1">
                        <div class="flex items-center">
                            <p class="font-semibold truncate">${song.title}</p>
                            ${youtubeIcon}
                        </div>
                        <p class="text-sm text-gray-400 truncate">${song.artist}</p>
                    </div>
                     <button class="play-song-btn p-2 rounded-full hover:bg-gray-700">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.188v3.624a1 1 0 001.555.816l3.066-1.812a1 1 0 000-1.632L9.555 7.168z" clip-rule="evenodd" /></svg>
                    </button>
                `;
                songEl.addEventListener('click', () => {
                    if (isYouTubeResult) {
                        loadSong(index, true);
                        openPlayer();
                    } else {
                        const originalIndex = songs.findIndex(s => s.id === song.id);
                        if (originalIndex !== -1) {
                            loadSong(originalIndex);
                            playSong();
                            openPlayer();
                        }
                    }
                });
                searchResultsList.appendChild(songEl);
            }

            // --- EVENT LISTENERS ---
            playPauseBtn.addEventListener('click', togglePlayPause);
            nextBtn.addEventListener('click', nextSong);
            prevBtn.addEventListener('click', prevSong);
            closePlayerBtn.addEventListener('click', closePlayer);
            
            shuffleBtn.addEventListener('click', () => {
                isShuffle = !isShuffle;
                shuffleBtn.classList.toggle('text-green-500', isShuffle);
                shuffleBtn.classList.toggle('text-gray-400', !isShuffle);
            });
            
            repeatBtn.addEventListener('click', () => {
                isRepeat = !isRepeat;
                repeatBtn.classList.toggle('text-green-500', isRepeat);
                repeatBtn.classList.toggle('text-gray-400', !isRepeat);
            });

            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('ended', () => {
                if (isRepeat) {
                    playSong();
                } else {
                    nextSong();
                }
            });
            progressSlider.addEventListener('input', (e) => {
                 const duration = audio.duration;
                 if(duration) {
                     audio.currentTime = (e.target.value / 100) * duration;
                 }
            });

            // --- INITIALIZATION ---
            function init() {
                renderSavedMusic();
                renderFavorites();
                renderPlaylists();
                loadSong(0);
                playPauseBtn.innerHTML = playIcon; // Set initial icon
            }

            init();
        });