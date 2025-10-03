// Wait for the DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {

            //==================================================================
            // #region CONFIG
            //==================================================================
            const YOUTUBE_API_KEY = 'AIzaSyBdsMMt_VBBMjB_jX8_P4aYIDbJmtORdDM'; 
            
            //==================================================================
            // #region DOM Elements
            //==================================================================
            const app = document.getElementById('app');
            const screens = document.querySelectorAll('.screen');
            const navItems = document.querySelectorAll('.nav-item');
            const searchInput = document.getElementById('search-input');
            const searchResultsContainer = document.getElementById('search-results');
            const miniPlayerContainer = document.getElementById('mini-player');
            const fullPlayerContainer = document.getElementById('full-player');
            const addToPlaylistModal = document.getElementById('add-to-playlist-modal');
            const modalPlaylistList = document.getElementById('modal-playlist-list');
            const libraryMainView = document.getElementById('library-main-view');
            const playlistDetailView = document.getElementById('playlist-detail-view');

            //==================================================================
            // #region Enhanced Smart Autoplay System with Advanced Detection
            //==================================================================
            class SmartAutoplay {
                constructor() {
                    this.playedSongs = new Set();
                    this.userPreferences = {
                        primaryLanguage: null,
                        primaryDecade: null, // NEW: Track primary decade preference
                        primaryGenres: new Set(), // NEW: Track dominant genres
                        languages: new Set(),
                        genres: new Set(),
                        artists: new Set(),
                        decades: new Set(),
                        keywords: new Set()
                    };
                    
                    // Enhanced language detection patterns
                    this.languagePatterns = {
                        hindi: {
                            keywords: ['hindi', 'bollywood', 'shah rukh', 'arijit', 'shreya', 'kumar sanu', 'lata', 'kishore', 'mohd rafi', 'asha bhosle', 'udit narayan', 'alka yagnik', 'sonu nigam', 'armaan malik', 'rahat fateh', 'gulzar', 'javed akhtar', 'yash chopra', 'karan johar', 'salman khan', 'aamir khan', 'hrithik roshan'],
                            artists: ['arijit singh', 'shreya ghoshal', 'kumar sanu', 'lata mangeshkar', 'kishore kumar', 'mohammed rafi', 'asha bhosle', 'udit narayan', 'alka yagnik', 'sonu nigam', 'kk', 'shaan', 'sunidhi chauhan', 'rahat fateh ali khan', 'armaan malik', 'darshan raval', 'jubin nautiyal', 'atif aslam', 'rahat fateh', 'hariharan'],
                            script: /[\u0900-\u097F]/
                        },
                        english: {
                            keywords: ['english', 'american', 'british', 'pop', 'rock', 'jazz', 'blues', 'country', 'rap', 'hip hop'],
                            artists: ['taylor swift', 'ed sheeran', 'justin bieber', 'ariana grande', 'billie eilish', 'the weeknd', 'drake', 'post malone', 'dua lipa', 'harry styles'],
                            script: /^[a-zA-Z\s\-\.,!?'"\(\)0-9]+$/
                        },
                        punjabi: {
                            keywords: ['punjabi', 'sidhu moose wala', 'diljit dosanjh', 'gurdas maan', 'ammy virk', 'guru randhawa'],
                            artists: ['sidhu moose wala', 'diljit dosanjh', 'gurdas maan', 'ammy virk', 'guru randhawa', 'jasmine sandlas', 'neha kakkar punjabi'],
                            script: /[\u0A00-\u0A7F]/
                        }
                    };

                    // Enhanced genre detection patterns with more specific keywords
                    this.genrePatterns = {
                        ghazal: ['ghazal', 'mehdi hassan', 'jagjit singh', 'begum akhtar', 'gulam ali', 'farida khanum', 'chitra singh', 'hariharan ghazal', 'pankaj udhas', 'talat aziz', 'penaz masani', 'anup jalota ghazal'],
                        qawwali: ['qawwali', 'nusrat fateh ali', 'rahat fateh ali', 'aziz mian', 'sabri brothers', 'ustad', 'allah hoo', 'qawwal', 'sufi qawwali'],
                        classical: ['classical', 'raag', 'raga', 'pandit', 'ustad', 'bhimsen joshi', 'ravi shankar', 'zakir hussain', 'hindustani', 'carnatic', 'sitar', 'tabla', 'veena'],
                        sufi: ['sufi', 'kalam', 'ishq', 'divine', 'spiritual', 'sufi music', 'mystical', 'dargah', 'peer', 'wali'],
                        devotional: ['bhajan', 'devotional', 'aarti', 'kirtan', 'shabad', 'mantra', 'spiritual', 'religious', 'god', 'ram', 'krishna', 'shiva', 'hanuman'],
                        folk: ['folk', 'lok geet', 'traditional', 'rajasthani', 'haryanvi', 'bihari', 'bhojpuri', 'marathi folk', 'gujarati folk'],
                        '90s': ['90s', '1990', '1991', '1992', '1993', '1994', '1995', '1996', '1997', '1998', '1999', 'nostalgic', 'classic bollywood', '90s hindi', '90s bollywood'],
                        '80s': ['80s', '1980', '1981', '1982', '1983', '1984', '1985', '1986', '1987', '1988', '1989', '80s hindi', '80s bollywood', 'retro bollywood'],
                        '70s': ['70s', '1970', '1971', '1972', '1973', '1974', '1975', '1976', '1977', '1978', '1979', '70s hindi', '70s bollywood', 'golden era'],
                        '2000s': ['2000s', '2000', '2001', '2002', '2003', '2004', '2005', '2006', '2007', '2008', '2009'],
                        romantic: ['romantic', 'love', 'ishq', 'pyaar', 'mohabbat', 'valentine', 'couple', 'romance'],
                        sad: ['sad', 'dukh', 'gam', 'emotional', 'heartbreak', 'breakup', 'alvida', 'udas', 'dard'],
                        item: ['item', 'dance', 'party', 'celebration', 'wedding', 'sangam', 'masti', 'thumka']
                    };

                    // Decade-specific artist patterns for better detection
                    this.decadeArtists = {
                        '70s': ['lata mangeshkar', 'kishore kumar', 'mohammed rafi', 'asha bhosle', 'manna dey', 'mukesh', 'geeta dutt', 'hemant kumar'],
                        '80s': ['lata mangeshkar', 'kishore kumar', 'mohammed rafi', 'asha bhosle', 'amit kumar', 'shailendra singh', 'kavita krishnamurthy', 'suresh wadkar'],
                        '90s': ['kumar sanu', 'udit narayan', 'alka yagnik', 'kavita krishnamurthy', 'sadhana sargam', 'abhijeet', 'vinod rathod', 'poornima'],
                        '2000s': ['sonu nigam', 'shreya ghoshal', 'kk', 'shaan', 'sunidhi chauhan', 'rahat fateh ali khan', 'kunal ganjawala']
                    };

                    this.hasUserStartedSession = false;
                }

                // Enhanced language detection
                detectLanguage(song) {
                    const text = `${song.title} ${song.artist}`.toLowerCase();
                    
                    for (const [language, patterns] of Object.entries(this.languagePatterns)) {
                        // Check keywords
                        const keywordMatch = patterns.keywords.some(keyword => text.includes(keyword));
                        
                        // Check artists
                        const artistMatch = patterns.artists.some(artist => 
                            text.includes(artist) || song.artist.toLowerCase().includes(artist)
                        );
                        
                        if (keywordMatch || artistMatch) {
                            return language;
                        }
                    }
                    
                    // Default to Hindi for Indian content
                    return 'hindi';
                }

                // Enhanced genre detection with weighted scoring
                detectGenres(song) {
                    const text = `${song.title} ${song.artist}`.toLowerCase();
                    const detectedGenres = [];
                    
                    for (const [genre, keywords] of Object.entries(this.genrePatterns)) {
                        let score = 0;
                        for (const keyword of keywords) {
                            if (text.includes(keyword)) {
                                // Give higher score for exact artist matches
                                if (song.artist.toLowerCase().includes(keyword)) {
                                    score += 3;
                                } else if (song.title.toLowerCase().includes(keyword)) {
                                    score += 2;  
                                } else {
                                    score += 1;
                                }
                            }
                        }
                        
                        // Include genre if score is high enough
                        if (score >= 1) {
                            detectedGenres.push({ genre, score });
                        }
                    }
                    
                    // Sort by score and return top genres
                    return detectedGenres
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 3)
                        .map(item => item.genre);
                }

                // Enhanced decade detection with artist patterns
                detectDecade(song) {
                    const text = `${song.title} ${song.artist}`.toLowerCase();
                    
                    // Check for explicit decade mentions first
                    for (const decade of ['70s', '80s', '90s', '2000s']) {
                        const patterns = this.genrePatterns[decade];
                        if (patterns.some(pattern => text.includes(pattern))) {
                            return decade;
                        }
                    }
                    
                    // Check decade-specific artists
                    for (const [decade, artists] of Object.entries(this.decadeArtists)) {
                        if (artists.some(artist => song.artist.toLowerCase().includes(artist) || text.includes(artist))) {
                            return decade;
                        }
                    }
                    
                    // Check for classic/old indicators
                    if (text.includes('classic') || text.includes('old') || text.includes('golden') || text.includes('vintage')) {
                        return '80s'; // Default classic to 80s
                    }
                    
                    return null;
                }

                markSessionStarted() {
                    this.hasUserStartedSession = true;
                    console.log('🎵 Music session started by user interaction');
                }

                canAutoplay() {
                    return this.hasUserStartedSession;
                }

                normalizeSongTitle(title) {
                    return title
                        .toLowerCase()
                        .replace(/\(.*?\)/g, '')
                        .replace(/\[.*?\]/g, '')  
                        .replace(/feat\..*|ft\..*|featuring.*/g, '')
                        .replace(/official.*|music.*video|lyric.*video/g, '')
                        .replace(/remix|version|cover|acoustic/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                }

                isSongPlayed(song) {
                    const normalizedTitle = this.normalizeSongTitle(song.title);
                    return this.playedSongs.has(normalizedTitle);
                }

                markSongAsPlayed(song) {
                    const normalizedTitle = this.normalizeSongTitle(song.title);
                    this.playedSongs.add(normalizedTitle);
                    
                    if (this.playedSongs.size > 100) {
                        const songsArray = Array.from(this.playedSongs);
                        this.playedSongs = new Set(songsArray.slice(-100));
                    }
                    
                    this.updatePreferences(song);
                }

                updatePreferences(song) {
                    // Detect and store language
                    const language = this.detectLanguage(song);
                    this.userPreferences.languages.add(language);
                    
                    // Set primary language (most played)
                    if (!this.userPreferences.primaryLanguage) {
                        this.userPreferences.primaryLanguage = language;
                    }
                    
                    // Detect and store genres with weighting
                    const genres = this.detectGenres(song);
                    genres.forEach(genre => {
                        this.userPreferences.genres.add(genre);
                        this.userPreferences.primaryGenres.add(genre);
                    });
                    
                    // Detect and store decade with priority
                    const decade = this.detectDecade(song);
                    if (decade) {
                        this.userPreferences.decades.add(decade);
                        // Set primary decade for era-based recommendations
                        if (!this.userPreferences.primaryDecade || 
                            ['70s', '80s', '90s'].includes(decade)) {
                            this.userPreferences.primaryDecade = decade;
                        }
                    }
                    
                    // Store artist
                    this.userPreferences.artists.add(song.artist.toLowerCase());
                    
                    // Extract meaningful keywords
                    const keywords = song.title.toLowerCase().split(/\s+/).concat(
                        song.artist.toLowerCase().split(/\s+/)
                    );
                    
                    keywords.forEach(keyword => {
                        if (keyword.length > 3) {
                            this.userPreferences.keywords.add(keyword);
                        }
                    });
                    
                    // Limit sizes
                    if (this.userPreferences.keywords.size > 50) {
                        const keywordsArray = Array.from(this.userPreferences.keywords);
                        this.userPreferences.keywords = new Set(keywordsArray.slice(-50));
                    }
                    
                    console.log(`🔍 Updated preferences - Language: ${language}, Genres: [${genres.join(', ')}], Decade: ${decade || 'unknown'}, Primary Decade: ${this.userPreferences.primaryDecade}`);
                }

                // Enhanced smart query generation with era-specific logic
                generateSmartQuery() {
                    const { primaryLanguage, primaryDecade, primaryGenres, languages, genres, decades, artists } = this.userPreferences;
                    
                    // If we have strong preferences, use them intelligently
                    if (primaryLanguage && languages.size > 0) {
                        const queryType = Math.random();
                        
                        // 50% chance: Era-specific queries (70s/80s/90s focused)
                        if (queryType < 0.5 && primaryDecade && ['70s', '80s', '90s'].includes(primaryDecade)) {
                            return this.getEraSpecificQuery(primaryDecade, primaryLanguage);
                        }
                        // 25% chance: Genre + Era combination
                        else if (queryType < 0.75 && genres.size > 0 && primaryDecade) {
                            const genreArray = Array.from(genres);
                            const randomGenre = genreArray[Math.floor(Math.random() * genreArray.length)];
                            
                            if (randomGenre === 'ghazal') {
                                return this.getGhazalQuery();
                            } else if (['70s', '80s', '90s'].includes(primaryDecade)) {
                                return `${primaryDecade} ${primaryLanguage} ${randomGenre} songs`;
                            } else {
                                return `${randomGenre} ${primaryLanguage} songs`;
                            }
                        }
                        // 15% chance: Similar artists from same era
                        else if (queryType < 0.9 && artists.size > 0) {
                            const artistArray = Array.from(artists);
                            const randomArtist = artistArray[Math.floor(Math.random() * artistArray.length)];
                            if (primaryDecade && ['70s', '80s', '90s'].includes(primaryDecade)) {
                                return `${randomArtist} ${primaryDecade} ${primaryLanguage} songs`;
                            } else {
                                return `${randomArtist} ${primaryLanguage} songs`;
                            }
                        }
                        // 10% chance: Pure language + era
                        else {
                            if (primaryDecade && ['70s', '80s', '90s'].includes(primaryDecade)) {
                                return `${primaryDecade} ${primaryLanguage} classic songs`;
                            } else {
                                return this.getLanguageSpecificQuery(primaryLanguage);
                            }
                        }
                    }
                    
                    // Fallback to general queries
                    const fallbackQueries = [
                        'trending hindi songs 2024', 'bollywood hits', 'arijit singh songs',
                        'shreya ghoshal hits', 'hindi romantic songs', '90s bollywood songs'
                    ];
                    return fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)];
                }

                // NEW: Era-specific query generation
                getEraSpecificQuery(era, language = 'hindi') {
                    const eraQueries = {
                        '70s': [
                            '70s hindi songs bollywood',
                            '1970s classic bollywood hits',
                            'kishore kumar 70s songs',
                            'lata mangeshkar 70s hits',
                            'mohammed rafi 70s songs',
                            '70s romantic hindi songs',
                            'golden era bollywood 70s',
                            'classic bollywood 1970s',
                            '70s hindi ghazals',
                            'vintage bollywood 70s'
                        ],
                        '80s': [
                            '80s hindi songs bollywood',
                            '1980s classic bollywood hits',
                            'kishore kumar 80s songs',
                            'lata mangeshkar 80s hits',
                            'amit kumar 80s songs',
                            '80s romantic hindi songs',
                            'retro bollywood 80s',
                            'classic bollywood 1980s',
                            '80s hindi ghazals',
                            'vintage bollywood 80s'
                        ],
                        '90s': [
                            '90s hindi songs bollywood',
                            '1990s classic bollywood hits',
                            'kumar sanu 90s songs',
                            'udit narayan 90s hits',
                            'alka yagnik 90s songs',
                            '90s romantic hindi songs',
                            'shah rukh khan 90s songs',
                            'classic bollywood 1990s',
                            '90s hindi party songs',
                            'nostalgic bollywood 90s'
                        ]
                    };
                    
                    const queries = eraQueries[era] || eraQueries['90s'];
                    return queries[Math.floor(Math.random() * queries.length)];
                }

                // Enhanced ghazal query with era consideration
                getGhazalQuery() {
                    const { primaryDecade } = this.userPreferences;
                    
                    const ghazalQueries = [
                        'jagjit singh ghazals',
                        'mehdi hassan ghazals',
                        'ghulam ali ghazals',
                        'hindi urdu ghazals',
                        'hariharan ghazals',
                        'chitra singh ghazals',
                        'classic ghazals collection',
                        'romantic ghazals hindi',
                        'pankaj udhas ghazals',
                        'talat aziz ghazals'
                    ];
                    
                    // Add era-specific ghazal queries if we have decade preference
                    if (['70s', '80s', '90s'].includes(primaryDecade)) {
                        ghazalQueries.push(`${primaryDecade} ghazals hindi`);
                        ghazalQueries.push(`classic ${primaryDecade} ghazals`);
                    }
                    
                    return ghazalQueries[Math.floor(Math.random() * ghazalQueries.length)];
                }

                getLanguageSpecificQuery(language) {
                    const { primaryDecade } = this.userPreferences;
                    
                    const languageQueries = {
                        hindi: [
                            'latest hindi songs 2024',
                            'bollywood trending hits',
                            'hindi romantic melodies',
                            'hindi sad songs',
                            'bollywood dance numbers'
                        ],
                        english: [
                            'english pop hits 2024',
                            'trending english songs',
                            'english romantic songs',
                            'pop music hits'
                        ],
                        punjabi: [
                            'punjabi songs 2024',
                            'latest punjabi hits',
                            'punjabi romantic songs'
                        ]
                    };
                    
                    let queries = languageQueries[language] || languageQueries.hindi;
                    
                    // Add era-specific queries if we have decade preference
                    if (['70s', '80s', '90s'].includes(primaryDecade)) {
                        queries = queries.concat([
                            `${primaryDecade} ${language} classic hits`,
                            `vintage ${primaryDecade} ${language} songs`
                        ]);
                    }
                    
                    return queries[Math.floor(Math.random() * queries.length)];
                }

                filterFreshSongs(songs) {
                    return songs.filter(song => !this.isSongPlayed(song));
                }

                async getNextSong() {
                    if (!this.canAutoplay()) {
                        console.log('🚫 Auto-play blocked: User has not started a music session yet');
                        return null;
                    }

                    const maxAttempts = 4; // Increased attempts for better matching
                    let attempts = 0;
                    
                    while (attempts < maxAttempts) {
                        try {
                            const query = this.generateSmartQuery();
                            console.log(`🎯 Smart autoplay searching: "${query}" (attempt ${attempts + 1})`);
                            
                            const response = await ApiService.search(query, 20); // More results for better filtering
                            
                            if (response.results && response.results.length > 0) {
                                const freshSongs = this.filterFreshSongs(response.results);
                                
                                if (freshSongs.length > 0) {
                                    // Score songs based on preference match
                                    const scoredSongs = this.scoreSongsByPreference(freshSongs);
                                    
                                    // Pick from top-scored songs with some randomness
                                    const topSongs = scoredSongs.slice(0, Math.min(5, scoredSongs.length));
                                    const selectedSong = topSongs[Math.floor(Math.random() * topSongs.length)].song;
                                    
                                    // Log what we detected about the song
                                    const detectedLang = this.detectLanguage(selectedSong);
                                    const detectedGenres = this.detectGenres(selectedSong);
                                    const detectedDecade = this.detectDecade(selectedSong);
                                    
                                    console.log(`🎵 Selected: "${selectedSong.title}" | Language: ${detectedLang} | Genres: [${detectedGenres.join(', ')}] | Decade: ${detectedDecade || 'unknown'}`);
                                    
                                    return selectedSong;
                                }
                            }
                            
                            attempts++;
                        } catch (error) {
                            console.error('❌ Smart autoplay search failed:', error);
                            attempts++;
                        }
                    }
                    
                    // Enhanced fallback
                    try {
                        const { primaryLanguage, primaryDecade } = this.userPreferences;
                        let fallbackQuery = 'hindi songs';
                        
                        if (primaryDecade && ['70s', '80s', '90s'].includes(primaryDecade)) {
                            fallbackQuery = `${primaryDecade} ${primaryLanguage || 'hindi'} songs`;
                        } else if (primaryLanguage) {
                            fallbackQuery = `${primaryLanguage} songs`;
                        }
                        
                        const response = await ApiService.search(fallbackQuery, 10);
                        if (response.results && response.results.length > 0) {
                            return response.results[Math.floor(Math.random() * response.results.length)];
                        }
                    } catch (error) {
                        console.error('❌ Fallback search failed:', error);
                    }
                    
                    return null;
                }

                // NEW: Score songs based on user preferences
                scoreSongsByPreference(songs) {
                    const { primaryLanguage, primaryDecade, primaryGenres, artists } = this.userPreferences;
                    
                    return songs.map(song => {
                        let score = 0;
                        
                        // Language match (highest priority)
                        const detectedLang = this.detectLanguage(song);
                        if (detectedLang === primaryLanguage) score += 10;
                        
                        // Decade match (very high priority for era-specific listening)
                        const detectedDecade = this.detectDecade(song);
                        if (detectedDecade === primaryDecade) score += 15;
                        
                        // Genre match
                        const detectedGenres = this.detectGenres(song);
                        detectedGenres.forEach(genre => {
                            if (primaryGenres.has(genre)) score += 5;
                        });
                        
                        // Artist familiarity
                        const artistLower = song.artist.toLowerCase();
                        if (Array.from(artists).some(artist => artistLower.includes(artist))) {
                            score += 3;
                        }
                        
                        return { song, score };
                    }).sort((a, b) => b.score - a.score);
                }

                resetPlayedSongs() {
                    this.playedSongs.clear();
                    this.hasUserStartedSession = false;
                    this.userPreferences = {
                        primaryLanguage: null,
                        primaryDecade: null,
                        primaryGenres: new Set(),
                        languages: new Set(),
                        genres: new Set(),
                        artists: new Set(),
                        decades: new Set(),
                        keywords: new Set()
                    };
                    console.log('🔄 Played songs history and preferences reset');
                }

                // Debug method to see current preferences
                getPreferences() {
                    return {
                        primaryLanguage: this.userPreferences.primaryLanguage,
                        primaryDecade: this.userPreferences.primaryDecade,
                        primaryGenres: Array.from(this.userPreferences.primaryGenres),
                        languages: Array.from(this.userPreferences.languages),
                        genres: Array.from(this.userPreferences.genres),
                        decades: Array.from(this.userPreferences.decades),
                        artists: Array.from(this.userPreferences.artists).slice(0, 5),
                        playedCount: this.playedSongs.size
                    };
                }
            }

            // Initialize smart autoplay system
            const smartAutoplay = new SmartAutoplay();

            //==================================================================
            // #region YouTube Player with Proper API
            //==================================================================
            let ytPlayer = null;
            let playerReady = false;

            // YouTube API Ready callback
            window.onYouTubeIframeAPIReady = function() {
                ytPlayer = new YT.Player('youtube-player', {
                    height: '0',
                    width: '0',
                    videoId: '', // Start with empty video ID
                    playerVars: {
                        'autoplay': 0,
                        'controls': 0,
                        'disablekb': 1,
                        'fs': 0,
                        'iv_load_policy': 3,
                        'modestbranding': 1,
                        'rel': 0,
                        'showinfo': 0,
                        'playsinline': 1
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange,
                        'onError': onPlayerError
                    }
                });
            };

            function onPlayerReady(event) {
                playerReady = true;
                console.log('🎵 YouTube player ready - waiting for user to select a song');
            }

            async function onPlayerStateChange(event) {
                const state = Store.getState();
                
                if (event.data === YT.PlayerState.ENDED) {
                    // Mark the current song as played ONLY when it ends naturally
                    if (state.currentlyPlaying) {
                        smartAutoplay.markSongAsPlayed(state.currentlyPlaying);
                        console.log(`✅ Song completed and marked as played: "${state.currentlyPlaying.title}"`);
                    }
                    
                    // Smart auto-play next song (only if session has started)
                    await Store.playSmartNext();
                } else if (event.data === YT.PlayerState.PLAYING) {
                    Store.setState({ isPlaying: true, isLoading: false });
                } else if (event.data === YT.PlayerState.PAUSED) {
                    Store.setState({ isPlaying: false });
                } else if (event.data === YT.PlayerState.BUFFERING) {
                    Store.setState({ isLoading: true });
                }
            }

            function onPlayerError(event) {
                console.error('❌ YouTube Player Error:', event.data);
                Store.setState({ isLoading: false, isPlaying: false });
                // Only try to play next song on error if session has started
                if (smartAutoplay.canAutoplay()) {
                    setTimeout(() => Store.playSmartNext(), 1000);
                }
            }

            //==================================================================
            // #region Enhanced Store with Smart Autoplay
            //==================================================================
            const Store = {
                state: {
                    currentlyPlaying: null,
                    isPlaying: false,
                    queue: [],
                    queueIndex: -1,
                    favorites: [],
                    history: [],
                    playlists: [],
                    isLoading: false,
                    autoplayMode: 'smart', // 'queue', 'smart', 'off'
                },
                listeners: [],

                getState() { return this.state; },
                setState(newState) {
                    this.state = { ...this.state, ...newState };
                    this.saveStateToLocalStorage();
                    this.notify();
                },
                subscribe(listener) {
                    this.listeners.push(listener);
                    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
                },
                notify() { 
                    // Debounce notifications to prevent excessive re-renders
                    if (this._notifyTimeout) clearTimeout(this._notifyTimeout);
                    this._notifyTimeout = setTimeout(() => {
                        this.listeners.forEach(listener => listener(this.state));
                    }, 16); // ~60fps
                },
                saveStateToLocalStorage() {
                    try {
                        const stateToSave = {
                            favorites: this.state.favorites,
                            history: this.state.history,
                            playlists: this.state.playlists,
                            autoplayMode: this.state.autoplayMode
                        };
                        localStorage.setItem('vibeStreamState', JSON.stringify(stateToSave));
                    } catch (e) { console.error("Could not save state to localStorage", e); }
                },
                loadStateFromLocalStorage() {
                    try {
                        const storedState = localStorage.getItem('vibeStreamState');
                        if (storedState) {
                            const parsedState = JSON.parse(storedState);
                            this.setState({
                                favorites: parsedState.favorites || [],
                                history: parsedState.history || [],
                                playlists: parsedState.playlists || [],
                                autoplayMode: parsedState.autoplayMode || 'smart'
                            });
                        }
                    } catch (e) { console.error("Could not load state from localStorage", e); }
                },
                async playSong(song, playlist = [], isUserInitiated = false) {
                    this.setState({ isLoading: true });
                    
                    // Mark session as started when user manually plays a song
                    if (isUserInitiated) {
                        smartAutoplay.markSessionStarted();
                        console.log(`🎵 User manually started playing: "${song.title}" by ${song.artist}`);
                    } else {
                        console.log(`🤖 Auto-playing: "${song.title}" by ${song.artist}`);
                    }
                    
                    const queueIndex = playlist.length > 0 ? playlist.findIndex(s => s.id === song.id) : 0;
                    
                    this.setState({
                        currentlyPlaying: song,
                        isPlaying: false, // Will be set to true by player state change
                        queue: playlist.length > 0 ? playlist : [song],
                        queueIndex: queueIndex,
                    });
                    
                    // Load video in YouTube player
                    if (playerReady && ytPlayer) {
                        ytPlayer.loadVideoById(song.id);
                        // Small delay then play
                        setTimeout(() => {
                            ytPlayer.playVideo();
                        }, 500);
                    }
                    
                    this.addToHistory(song);
                },
                togglePlayPause() { 
                    if (playerReady && ytPlayer) {
                        if (this.state.isPlaying) {
                            ytPlayer.pauseVideo();
                        } else {
                            ytPlayer.playVideo();
                        }
                    }
                },
                async playNext() {
                    const { queue, queueIndex } = this.state;
                    if (queue.length > 1 && queueIndex < queue.length - 1) {
                        // Play next in queue if available
                        const nextIndex = queueIndex + 1;
                        await this.playSong(queue[nextIndex], queue, false); // Not user initiated
                    } else {
                        // Switch to smart autoplay
                        await this.playSmartNext();
                    }
                },
                async playPrev() {
                    const { queue, queueIndex } = this.state;
                    if (queue.length > 0) {
                        const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
                        await this.playSong(queue[prevIndex], queue, false); // Not user initiated
                    }
                },
                async playSmartNext() {
                    // Check if autoplay is enabled and if user has started a session
                    if (this.state.autoplayMode === 'off' || !smartAutoplay.canAutoplay()) {
                        console.log('🚫 Smart autoplay skipped - either disabled or no user session started');
                        this.setState({ isLoading: false });
                        return;
                    }
                    
                    this.setState({ isLoading: true });
                    
                    try {
                        const nextSong = await smartAutoplay.getNextSong();
                        if (nextSong) {
                            console.log(`🎯 Smart autoplay selected: "${nextSong.title}" by ${nextSong.artist}`);
                            await this.playSong(nextSong, [], false); // Auto-play, not user initiated
                        } else {
                            console.log('❌ Smart autoplay could not find a suitable next song');
                            this.setState({ isLoading: false });
                        }
                    } catch (error) {
                        console.error('❌ Smart autoplay failed:', error);
                        this.setState({ isLoading: false });
                    }
                },
                setAutoplayMode(mode) {
                    this.setState({ autoplayMode: mode });
                    console.log(`🔄 Autoplay mode set to: ${mode}`);
                },
                resetSmartAutoplay() {
                    smartAutoplay.resetPlayedSongs();
                },
                getSmartAutoplayPreferences() {
                    return smartAutoplay.getPreferences();
                },
                toggleFavorite(song) {
                    const isFavorited = this.state.favorites.some(fav => fav.id === song.id);
                    let newFavorites;
                    if (isFavorited) {
                        newFavorites = this.state.favorites.filter(fav => fav.id !== song.id);
                    } else {
                        newFavorites = [song, ...this.state.favorites];
                    }
                    this.setState({ favorites: newFavorites });
                },
                addToHistory(song) {
                    const newHistory = [song, ...this.state.history.filter(item => item.id !== song.id)].slice(0, 20);
                    this.setState({ history: newHistory });
                },
                clearHistory() { this.setState({ history: [] }); },
                createPlaylist(name) {
                    if (!name || name.trim() === '') return;
                    const newPlaylist = {
                        id: Date.now().toString(),
                        name: name.trim(),
                        songs: []
                    };
                    this.setState({ playlists: [newPlaylist, ...this.state.playlists] });
                },
                addSongToPlaylist(playlistId, song) {
                    const newPlaylists = this.state.playlists.map(p => {
                        if (p.id === playlistId && !p.songs.some(s => s.id === song.id)) {
                            return { ...p, songs: [song, ...p.songs] };
                        }
                        return p;
                    });
                    this.setState({ playlists: newPlaylists });
                },
                removeSongFromPlaylist(playlistId, songId) {
                    const newPlaylists = this.state.playlists.map(p => {
                        if (p.id === playlistId) {
                            return { ...p, songs: p.songs.filter(s => s.id !== songId) };
                        }
                        return p;
                    });
                    this.setState({ playlists: newPlaylists });
                },
                deletePlaylist(playlistId) {
                    if (window.confirm('Are you sure you want to delete this playlist?')) {
                        const newPlaylists = this.state.playlists.filter(p => p.id !== playlistId);
                        this.setState({ playlists: newPlaylists });
                    }
                }
            };
            Store.loadStateFromLocalStorage();

            //==================================================================
            // #region API Service with Caching
            //==================================================================
            const ApiService = {
                cache: new Map(),
                
                async search(query, maxResults = 10) {
                    // Check cache first
                    const cacheKey = `search_${query}_${maxResults}`;
                    if (this.cache.has(cacheKey)) {
                        return this.cache.get(cacheKey);
                    }
                    
                    if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE' || !YOUTUBE_API_KEY) {
                        console.error("YouTube API key is missing.");
                        return { error: 'api_key_missing' };
                    }
                    
                    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
                    
                    try {
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        const data = await response.json();
                        const result = { results: this.formatResults(data.items) };
                        
                        // Cache the result for 5 minutes
                        this.cache.set(cacheKey, result);
                        setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
                        
                        return result;
                    } catch (error) {
                        console.error('YouTube API Error:', error);
                        return { error: 'fetch_failed' };
                    }
                },
                formatResults(items) {
                    return items.filter(item => item.id.videoId).map(item => ({
                        id: item.id.videoId,
                        title: item.snippet.title,
                        artist: item.snippet.channelTitle,
                        artwork: item.snippet.thumbnails.high.url,
                    }));
                }
            };

            //==================================================================
            // #region Player Component with Enhanced Status
            //==================================================================
            let progressInterval;
            
            const updatePlayer = state => {
                renderPlayerUI(state);
                
                if (state.isPlaying && !state.isLoading) {
                    if (!progressInterval) {
                        progressInterval = setInterval(updateProgressBar, 1000);
                    }
                } else {
                    if (progressInterval) {
                        clearInterval(progressInterval);
                        progressInterval = null;
                    }
                }
            };
            
            const renderPlayerUI = state => {
                const { currentlyPlaying, isPlaying, favorites, isLoading, autoplayMode } = state;
                const fullPlayerContent = document.querySelector('.full-player-content');
                const fullPlayerBackground = document.querySelector('.full-player-background');

                if (!currentlyPlaying) {
                    miniPlayerContainer.classList.add('translate-y-[200%]');
                    fullPlayerContainer.classList.add('translate-y-full');
                    return;
                }
                
                miniPlayerContainer.classList.remove('translate-y-[200%]');
                fullPlayerBackground.style.backgroundImage = `url(${currentlyPlaying.artwork})`;
                const isFavorited = favorites.some(fav => fav.id === currentlyPlaying.id);
                
                // Show loading state in mini player
                const playButtonContent = isLoading 
                    ? '<div class="loading-spinner"></div>' 
                    : `<i class="ph-duotone ${isPlaying ? 'ph-pause-circle' : 'ph-play-circle'} text-4xl"></i>`;
                
                miniPlayerContainer.innerHTML = `<img src="${currentlyPlaying.artwork}" class="w-11 h-11 rounded object-cover"><div class="flex-grow overflow-hidden"><div class="font-medium whitespace-nowrap overflow-hidden text-ellipsis">${currentlyPlaying.title}</div><div class="text-neutral-400 text-sm">${currentlyPlaying.artist}</div></div><button id="mini-player-play-btn" ${isLoading ? 'disabled' : ''}>${playButtonContent}</button>`;
                
                const fullPlayerPlayButtonContent = isLoading 
                    ? '<div class="loading-spinner"></div>' 
                    : `<i class="ph-duotone ${isPlaying ? 'ph-pause' : 'ph-play'} text-4xl text-neutral-900"></i>`;
                
                // Enhanced autoplay mode indicator with detailed preferences
                let autoplayIndicator = '⏹️ Autoplay Off';
                if (autoplayMode === 'smart') {
                    const preferences = smartAutoplay.getPreferences();
                    if (preferences.primaryLanguage) {
                        let details = preferences.primaryLanguage;
                        if (preferences.primaryDecade) {
                            details += ` • ${preferences.primaryDecade}`;
                        }
                        if (preferences.primaryGenres.length > 0) {
                            details += ` • ${preferences.primaryGenres.slice(0, 2).join(', ')}`;
                        }
                        autoplayIndicator = `🎯 Smart: ${details}`;
                    } else {
                        autoplayIndicator = '🎯 Smart Autoplay';
                    }
                }
                
                fullPlayerContent.innerHTML = `<div class="flex justify-between items-center flex-shrink-0"><button class="down-chevron"><i class="ph-duotone ph-caret-down text-2xl"></i></button><div class="text-center"><div class="font-semibold text-lg">Now Playing</div><div class="text-xs text-neutral-400 mt-1 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">${autoplayIndicator}</div></div><button class="favorite-btn ${isFavorited ? 'text-brand-accent' : 'text-white'}" data-song-id="${currentlyPlaying.id}"><i class="ph-duotone ph-heart text-2xl"></i></button></div><div class="flex-grow flex items-center justify-center py-8"><img src="${currentlyPlaying.artwork}" class="w-4/5 max-w-[350px] aspect-square rounded-xl shadow-2xl"></div><div class="text-center mb-6"><div class="text-2xl font-bold mb-2">${currentlyPlaying.title}</div><div class="text-base text-neutral-400">${currentlyPlaying.artist}</div></div><div class="w-full"><input type="range" min="0" max="100" value="0" class="progress-bar w-full h-1.5 bg-neutral-600 rounded-full appearance-none cursor-pointer" id="progress-bar" ${isLoading ? 'disabled' : ''}><div class="flex justify-between text-xs text-neutral-400 mt-2"><span id="current-time">0:00</span><span id="duration">0:00</span></div></div><div class="flex justify-around items-center w-full mt-6"><button class="prev-next-btn" id="prev-btn" ${isLoading ? 'disabled' : ''}><i class="ph-duotone ph-skip-back-circle text-5xl"></i></button><button class="play-pause-btn w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center transition-transform hover:scale-105" id="full-player-play-btn" ${isLoading ? 'disabled' : ''}>${fullPlayerPlayButtonContent}</button><button class="prev-next-btn" id="next-btn" ${isLoading ? 'disabled' : ''}><i class="ph-duotone ph-skip-forward-circle text-5xl"></i></button></div><div class="flex justify-center items-center gap-4 mt-4"><button id="autoplay-toggle" class="text-xs px-3 py-1 rounded-full border border-neutral-600 text-neutral-400 hover:text-white transition-colors max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">${autoplayIndicator}</button></div>`;
                addPlayerEventListeners();
            };
            
            const formatTime = seconds => {
                if (isNaN(seconds) || seconds < 0) return "0:00";
                const minutes = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
            };
            
            const updateProgressBar = () => {
                if (playerReady && ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration) {
                    try {
                        const currentTime = ytPlayer.getCurrentTime();
                        const duration = ytPlayer.getDuration();
                        
                        if (duration > 0) {
                            const progress = (currentTime / duration) * 100;
                            const progressBar = document.getElementById('progress-bar');
                            const currentTimeEl = document.getElementById('current-time');
                            const durationEl = document.getElementById('duration');
                            
                            if (progressBar) progressBar.value = progress;
                            if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
                            if (durationEl) durationEl.textContent = formatTime(duration);
                        }
                    } catch (error) {
                        // Silently handle errors when player is not ready
                    }
                }
            };
            
            const scrubProgressBar = e => {
                if (playerReady && ytPlayer && ytPlayer.getDuration) {
                    try {
                        const duration = ytPlayer.getDuration();
                        if (duration > 0) {
                            const seekTime = (e.target.value / 100) * duration;
                            ytPlayer.seekTo(seekTime, true);
                        }
                    } catch (error) {
                        console.error('Error seeking:', error);
                    }
                }
            };
            
            Store.subscribe(updatePlayer);

            // Fix 1: Ensure correct song is selected when clicked
function playSong(song, songList = null) {
    // Stop any currently playing song first
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
    }
    
    // Set the current song explicitly
    currentSong = song;
    currentPlaylist = songList || [song];
    currentSongIndex = songList ? songList.findIndex(s => s.id === song.id) : 0;
    
    // Make sure we're playing the correct song
    loadSong(song);
}

// Fix 2: Update your click event handler to prevent autoplay conflicts
function handleSongClick(song) {
    // Clear any existing autoplay timeout
    if (autoplayTimeout) {
        clearTimeout(autoplayTimeout);
        autoplayTimeout = null;
    }
    
    // Stop current playback
    if (isPlaying) {
        pauseCurrentSong();
    }
    
    // Play the selected song
    playSong(song);
}

// Fix 3: Modify the YouTube player ready function
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,  // Disable autoplay initially
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'iv_load_policy': 3,
            'modestbranding': 1,
            'playsinline': 1,
            'rel': 0
        },
        events: {
            'onReady': function(event) {
                console.log('YouTube player ready');
            },
            'onStateChange': function(event) {
                handlePlayerStateChange(event);
            }
        }
    });
}

// Fix 4: Update player state change handler
function handlePlayerStateChange(event) {
    const state = event.data;
    
    if (state === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayButton();
        startProgressUpdate();
    } else if (state === YT.PlayerState.PAUSED) {
        isPlaying = false;
        updatePlayButton();
        stopProgressUpdate();
    } else if (state === YT.PlayerState.ENDED) {
        isPlaying = false;
        updatePlayButton();
        stopProgressUpdate();
        
        // Only auto-advance if user didn't manually select a song
        if (autoplayEnabled && currentPlaylist && currentPlaylist.length > 1) {
            setTimeout(() => {
                playNextSong();
            }, 1000);
        }
    }
}

// Fix 5: Update your search result click handlers
document.addEventListener('click', function(e) {
    // Handle song item clicks
    if (e.target.closest('.song-item')) {
        const songItem = e.target.closest('.song-item');
        const songData = JSON.parse(songItem.dataset.song);
        
        // Prevent event bubbling
        e.preventDefault();
        e.stopPropagation();
        
        // Handle the song selection
        handleSongClick(songData);
        return;
    }
    
    // Handle play button clicks within song items
    if (e.target.closest('.play-btn')) {
        const playBtn = e.target.closest('.play-btn');
        const songItem = playBtn.closest('.song-item');
        const songData = JSON.parse(songItem.dataset.song);
        
        e.preventDefault();
        e.stopPropagation();
        
        handleSongClick(songData);
        return;
    }
});

// Fix 6: Make sure loadSong function loads the correct song
function loadSong(song) {
    if (!player || !song || !song.id) {
        console.error('Player not ready or invalid song data');
        return;
    }
    
    try {
        // Extract video ID from YouTube URL or use direct ID
        const videoId = extractVideoId(song.id);
        
        if (!videoId) {
            console.error('Invalid video ID:', song.id);
            return;
        }
        
        // Load and play the specific video
        player.loadVideoById({
            videoId: videoId,
            startSeconds: 0
        });
        
        // Update UI
        updateCurrentSongInfo(song);
        showMiniPlayer();
        
    } catch (error) {
        console.error('Error loading song:', error);
    }
}

// Fix 7: Helper function to extract video ID
function extractVideoId(url) {
    if (!url) return null;
    
    // If it's already just an ID
    if (url.length === 11 && !url.includes('/')) {
        return url;
    }
    
    // Extract from various YouTube URL formats
    const regexes = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const regex of regexes) {
        const match = url.match(regex);
        if (match) return match[1];
    }
    
    return null;
}

//==================================================================
            // #region App Initialization
            //==================================================================
            function getGreeting() {
                const hour = new Date().getHours();
                if (hour < 12) return "Good morning ☀️";
                if (hour < 18) return "Good afternoon 🌤️";
                return "Good evening 🌙";
            }
            
            function init() {
                setupNav(); 
                setupSearch(); 
                setupLibraryTabs(); 
                setupPlaylistModal();
                UI.renderHomeScreen(); 
                UI.renderLibraryScreen();
                
                // Add keyboard shortcuts for testing
                document.addEventListener('keydown', (e) => {
                    if (e.ctrlKey && e.key === 'n') { // Ctrl+N: Force next smart song
                        e.preventDefault();
                        Store.playSmartNext();
                    }
                    if (e.ctrlKey && e.key === 'r') { // Ctrl+R: Reset smart autoplay
                        e.preventDefault();
                        Store.resetSmartAutoplay();
                        console.log('Smart autoplay memory reset');
                    }
                });
            }
            
            init();
        });