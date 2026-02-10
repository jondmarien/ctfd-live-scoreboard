/** ISSessions Fantasy CTF - Guild Quest Board **/ 
/**
 * Based off the CTFd API - https://docs.ctfd.io/docs/api/getting-started/    
 * Fantasy Tavern Theme Edition - 2026
 */

// HTML Sanitization - Prevents XSS attacks from malicious team/user names
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Scoreboard Class
class Scoreboard {
    constructor() {
        console.log('Guild Quest Board: Initializing...');

        this.container = document.getElementById('scoreboard');
        if (!this.container) {
            console.error('Quest Board: Container element not found');
        }

        this.setupTeamInteractions();
        this.lastUpdate = null;
        this.updateInterval = null;
        this.isLoading = false;
        
        // Initialize tavern ember particles after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initTavernAmbience());
        } else {
            this.initTavernAmbience();
        }

        this.startAutoUpdate();
        
        console.log('Guild Quest Board: The tavern is open for adventurers!');
    }
    
    // Tavern Ambience - Floating embers and firefly particles
    initTavernAmbience() {
        console.log('Tavern Ambience: Starting initialization');
        try {
            const canvas = document.getElementById('emberCanvas');
            if (!canvas) {
                console.error('Tavern Ambience: Canvas element not found');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Tavern Ambience: Unable to get canvas context');
                return;
            }

            // Set canvas to full viewport size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            console.log(`Magic Particles: Canvas dimensions set to ${canvas.width}x${canvas.height}`);
            
            // Magical rune characters (Elder Futhark + fantasy symbols)
            const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛟ', 'ᛞ', '✦', '⚔', '🗡', '⬥'];
            
            // Color palette
            const colors = [
                'rgba(255, 215, 0, 0.6)',    // Gold
                'rgba(139, 92, 246, 0.6)',   // Purple magic
                'rgba(255, 107, 53, 0.5)',   // Torch orange
                'rgba(0, 255, 255, 0.4)',    // Magic cyan
                'rgba(80, 200, 120, 0.4)',   // Emerald
            ];
            
            // Particle class
            class Particle {
                constructor() {
                    this.reset();
                }
                
                reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + 10 + Math.random() * 50;
                    this.speed = 0.3 + Math.random() * 1.2;
                    this.opacity = 0.2 + Math.random() * 0.6;
                    this.maxOpacity = this.opacity;
                    this.wobble = Math.random() * Math.PI * 2;
                    this.wobbleSpeed = 0.01 + Math.random() * 0.03;
                    this.wobbleAmount = 0.3 + Math.random() * 1.5;
                    this.life = 0;
                    this.maxLife = 200 + Math.random() * 400;
                    
                    // ~20% chance to be a floating rune, rest are embers
                    this.isRune = Math.random() < 0.2;
                    
                    if (this.isRune) {
                        // Floating rune particle
                        this.rune = runes[Math.floor(Math.random() * runes.length)];
                        this.color = colors[Math.floor(Math.random() * colors.length)];
                        this.size = 14 + Math.random() * 10;
                        this.speed = 0.4 + Math.random() * 0.8; // Runes float slower
                        this.r = 0; this.g = 0; this.b = 0; // Not used for rune draw
                    } else {
                        // Ember particle
                        this.size = 1 + Math.random() * 3;
                        const colorChoice = Math.random();
                        if (colorChoice < 0.4) {
                        // Orange ember
                            this.r = 255; this.g = 120 + Math.random() * 60; this.b = 30 + Math.random() * 30;
                        } else if (colorChoice < 0.7) {
                        // Gold spark
                            this.r = 255; this.g = 200 + Math.random() * 55; this.b = 0;
                        } else if (colorChoice < 0.9) {
                        // Red hot ember
                            this.r = 255; this.g = 60 + Math.random() * 40; this.b = 10;
                        } else {
                        // Rare purple magic spark  
                            this.r = 139; this.g = 92; this.b = 246;
                        }
                    }
                }
                
                update() {
                    this.y -= this.speed;
                    this.wobble += this.wobbleSpeed;
                    this.x += Math.sin(this.wobble) * this.wobbleAmount;
                    this.life++;
                    
                    // Fade in at start
                    if (this.life < 30) {
                        this.opacity = this.maxOpacity * (this.life / 30);
                    }
                    
                    // Fade out near top or end of life
                    if (this.y < canvas.height * 0.2 || this.life > this.maxLife * 0.7) {
                        this.opacity *= 0.98;
                    }
                    
                    // Size shrinks as ember cools
                    if (this.life > this.maxLife * 0.5) {
                        this.size *= 0.999;
                    }
                    
                    // Reset when off screen, faded, or life ended
                    if (this.y < -20 || this.opacity < 0.01 || this.life > this.maxLife) {
                        this.reset();
                    }
                }
                
                draw() {
                    ctx.save();
                    ctx.globalAlpha = this.opacity;
                    
                    // Glow effect for runes
                    if (this.isRune) {
                        // Draw as a floating rune character
                        ctx.fillStyle = this.color;
                        ctx.font = `${this.size}px serif`;
                        ctx.textAlign = 'center';
                        ctx.shadowColor = this.color;
                        ctx.shadowBlur = 12;
                        ctx.fillText(this.rune, this.x, this.y);
                    } else {
                        // Draw as an ember dot
                        ctx.shadowColor = `rgba(${this.r}, ${this.g}, ${this.b}, 0.8)`;
                        ctx.shadowBlur = this.size * 4;
                    
                        // Draw ember as a soft circle
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${this.r}, ${this.g}, ${this.b}, 1)`;
                        ctx.fill();
                    }
                    
                    ctx.restore();
                }
            }
            
            // Firefly class — occasional bright golden sparkles
            class Firefly {
                constructor() {
                    this.reset();
                }
                
                reset() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.opacity = 0;
                    this.targetOpacity = 0.3 + Math.random() * 0.5;
                    this.size = 1.5 + Math.random() * 2;
                    this.phase = Math.random() * Math.PI * 2;
                    this.phaseSpeed = 0.02 + Math.random() * 0.03;
                    this.driftX = (Math.random() - 0.5) * 0.3;
                    this.driftY = (Math.random() - 0.5) * 0.3;
                    this.fadeIn = true;
                    this.life = 0;
                    this.maxLife = 100 + Math.random() * 300;
                }
                
                update() {
                    this.phase += this.phaseSpeed;
                    this.x += this.driftX + Math.sin(this.phase) * 0.2;
                    this.y += this.driftY + Math.cos(this.phase) * 0.15;
                    this.life++;
                    
                    // Twinkle effect
                    if (this.fadeIn) {
                        this.opacity = Math.min(this.targetOpacity, this.opacity + 0.01);
                        if (this.opacity >= this.targetOpacity) this.fadeIn = false;
                    }
                    
                    if (this.life > this.maxLife * 0.6) {
                        this.opacity *= 0.97;
                    }
                    
                    if (this.life > this.maxLife || this.opacity < 0.01) {
                        this.reset();
                    }
                }
                
                draw() {
                    ctx.save();
                    ctx.globalAlpha = this.opacity;
                    
                    // Bright golden glow
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.9)';
                    ctx.shadowBlur = this.size * 6;
                    
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 230, 100, 1)';
                    ctx.fill();
                    
                    ctx.restore();
                }
            }
            
            // Create particles
            const emberCount = Math.floor(canvas.width / 50); // ~25-40 embers
            const fireflyCount = Math.floor(canvas.width / 200); // ~6-10 fireflies
            const embers = [];
            const fireflies = [];
            
            for (let i = 0; i < emberCount; i++) {
                const ember = new Particle();
                ember.y = Math.random() * canvas.height; // Spread initial positions
                ember.life = Math.random() * ember.maxLife; // Stagger life cycles
                embers.push(ember);
            }
            
            for (let i = 0; i < fireflyCount; i++) {
                const firefly = new Firefly();
                firefly.life = Math.random() * firefly.maxLife;
                fireflies.push(firefly);
            }
            
            console.log(`Tavern Ambience: Created ${emberCount} embers, ${fireflyCount} fireflies`);

            function drawTavernAmbience() {
                // Clear with slight fade for trail effect
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw all embers
                embers.forEach(ember => {
                    ember.update();
                    ember.draw();
                });
                
                // Draw all fireflies
                fireflies.forEach(firefly => {
                    firefly.update();
                    firefly.draw();
                });
                
                requestAnimationFrame(drawTavernAmbience);
            }

            // Use requestAnimationFrame for smooth animation
            requestAnimationFrame(drawTavernAmbience);
            
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });

            console.log('Tavern Ambience: Initialization complete');
        } catch (error) {
            console.error('Tavern Ambience: Initialization failed', error);
        }
    }

    showLoading() {
        this.isLoading = true;
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <div class="loading-text">Consulting the Oracle...</div>
            </div>
        `;
    }

    showError(message) {
        this.isLoading = false;
        this.container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-message">The scrying failed: ${message}</div>
                <button onclick="scoreboard.retryUpdate()">Try Again</button>
            </div>
        `;
    }

    // Function to handle party interactions
    setupTeamInteractions() {
        // Remove old event listeners by replacing the container
        const newContainer = this.container.cloneNode(true);
        this.container.parentNode.replaceChild(newContainer, this.container);
        this.container = newContainer;
    
        // Add new event listeners with proper delegation
        this.container.addEventListener('click', (e) => {
            const teamHeader = e.target.closest('.team-header');
            if (!teamHeader) return;
    
            const team = teamHeader.closest('.team');
            const membersDiv = team?.querySelector('.members');
            
            if (membersDiv) {
                const isHidden = membersDiv.style.display === 'none';
                membersDiv.style.display = isHidden ? 'block' : 'none';
                team.classList.toggle('expanded');
            }
        });
    }

    // Function to return mock data with fantasy theme
    getMockData() {
        return [
            {
                id: 35,
                name: "Dragon Slayers United",
                score: 300,
                pos: 1,
                members: [
                    { id: 2, name: "Thorin Ironforge", score: 150 },
                    { id: 3, name: "Elara Moonwhisper", score: 150 }
                ],
                solves: [
                    { challenge_id: 101, value: 100 },
                    { challenge_id: 102, value: 200 }
                ]
            },
            {
                id: 36,
                name: "Arcane Assembly",
                score: 250,
                pos: 2,
                members: [
                    { id: 4, name: "Magnus the Wise", score: 125 }
                ],
                solves: [
                    { challenge_id: 103, value: 125 }
                ]
            },
            {
                id: 37,
                name: "Rogue Squadron",
                score: 200,
                pos: null, // Test null position
                members: [], // Test empty members
                solves: []
            }
        ];
    }

    // Render mock data
    renderMockData() {
        const mockData = this.getMockData();
        let html = '<div class="scoreboard-container">';
        mockData.forEach((team, index) => {
            html += this.renderTeam(team, index);
        });
        html += '</div>';
        return html;
    }
    
    renderTeam(team, index) {
        // Null check for position with fallback to index + 1
        const position = team.pos ?? index + 1;
        
        // Solve count with null protection and unique solve count
        const uniqueUsers = new Set();

        // When processing solves with null protection
        const uniqueSolves = (team.solves || []).filter(solve => {
            if (!solve || !solve.user_id || solve.challenge_id === null) {
                return false;
            }
            if (uniqueUsers.has(solve.user_id)) {
                return false;
            }
            uniqueUsers.add(solve.user_id);
            return true;
        });
        
        // Protected solve count
        const solveCount = uniqueSolves.length;
        
        // Null check for score with fallback to 0
        team.score = team.score ?? 0;

        // Members with empty array fallback
        const members = team.members || [];
    
    // Sanitize all user-controlled data to prevent XSS
        const safeName = escapeHTML(team.name);
        const safeScore = Number(team.score) || 0;
        const safeId = Number(team.id) || 0;
    
        // Fantasy terminology: quests instead of solves, GP instead of pts
        return `
        <div class="team" data-team-id="${safeId}">
            <div class="team-header team-name">
                <span class="position">#${position}</span>
                <span class="name" data-text="${safeName}">${safeName}</span>
                <div class="solves-count">${solveCount} ${solveCount === 1 ? 'quest' : 'quests'} | ${safeScore} GP</div>
            </div>
            ${members.length > 0 ? `
            <div class="members" style="display: none;">
                ${members.map(member => {
                    const safeMemberName = escapeHTML(member.name) || 'Unknown Adventurer';
                    const safeMemberScore = Number(member.score) || 0;
                    return `
                    <div class="member">
                        <span class="member-name" data-text="${safeMemberName}">${safeMemberName}</span>
                        <span class="member-score">${safeMemberScore}</span>
                    </div>
                `}).join('')}
            </div>` : ''}
        </div>
    `;
    }

    startAutoUpdate() {
        this.updateScoreboard(); // Initial update
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.updateScoreboard();
        }, window.CONFIG.UPDATE_INTERVAL);

        // Add cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        });
    }
    
    // Add cleanup method
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    // Function to fetch scoreboard data
    async fetchScoreboard() {
        // Validate configuration
        console.log('CONFIG at initialization:', window.CONFIG);
        
        if (!window.CONFIG?.API_URL) {
            throw new Error('API URL is not defined in config.js');
        }
    
        try {
            console.log('Fetching quest board data from:', window.CONFIG.API_URL);

            const response = await fetch(window.CONFIG.API_URL, {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${window.CONFIG.API_TOKEN}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'omit'  // Don't send cookies to avoid CORS preflight issues
            });
    
            // Handle HTTP errors
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }
    
            // Validate content type
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error("Invalid response content type");
            }
    
            const data = await response.json();
            console.log('Data received:', data);

            // Validate response structure
            if (!data?.success || !Array.isArray(data.data)) {
                throw new Error("Invalid API response structure");
            }
    
            return data.data.map(team => ({
                id: team.account_id,
                name: team.name,
                score: team.score,
                pos: team.pos,
                members: team.members || []
            }));

        } catch (error) {
            console.error('Quest Board Fetch error:', error);
            
            // Better error messages for common issues
            let errorMessage = error.message;
            if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
                errorMessage = 'CORS blocked or network error. Ensure CTFd allows cross-origin requests.';
                console.error('CORS Troubleshooting: The CTFd server needs to include Access-Control-Allow-Origin headers.');
                console.error('If self-hosting CTFd, add CORS headers in nginx/config or use a reverse proxy.');
            }
            
            this.showError(errorMessage);
            
            console.log('Loading demo adventuring parties...');
            this.isLoading = false;
            // Fallback to mock data
            return this.getMockData();
        }
    }

    // Function to update the scoreboard
    async updateScoreboard() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.showLoading();
    
        try {
            const responseData = await this.fetchScoreboard();
            const data = Array.isArray(responseData) ? responseData : this.getMockData();
    
            if (!Array.isArray(data)) {
                throw new Error('Quest board data is not an array');
            }
    
            // Open scoreboard-container
            let html = '<div class="scoreboard-container">';
    
            // Handle empty state with fantasy flair
            if (!data || data.length === 0) {
                html += `
                    <div class="error-state">
                        <span class="glitch-text">NO ADVENTURERS HAVE JOINED</span><br>
                        <span class="subtext">// The guild awaits brave souls...</span>
                    </div>
                `;
            } else {
                // Render parties
                data.forEach((team, index) => {
                    html += this.renderTeam(team, index);
                });
            }
    
            // Add timestamp using the new generateTimestampHTML method
            const result = this.generateTimestampHTML(html);
            html = result.html;
            const now = result.now;
    
            this.container.innerHTML = html;
            this.setupTeamInteractions();
            this.lastUpdate = now;
    
            console.log('Guild Quest Board updated successfully.');
        } catch (error) {
            console.error('Update failed:', error);
            this.showError('ARCANE DISRUPTION - CHECK CONSOLE');
            console.error('Full error object:', error)

            // Use the new renderMockDataWithTimestamp for error state
            this.container.innerHTML = this.renderMockDataWithTimestamp();
        } finally {
            this.isLoading = false;
        }
    }

    // Function to render mock data with timestamp
    renderMockDataWithTimestamp() {
        const mockData = this.getMockData();
        let html = '<div class="scoreboard-container">';
        
        mockData.forEach((team, index) => {
            html += this.renderTeam(team, index);
        });
    
        const now = new Date();
        html += `
            <div class="last-updated">
                <span class="timestamp-label">LAST SCRYING:</span>
                <span class="timestamp-value">
                    ${now.toLocaleDateString()} ${now.toLocaleTimeString()}
                </span>
            </div>
        </div>`; // Close scoreboard-container
    
        return html;
    }
   
    // Function to generate timestamp HTML for live scoreboard updates
    generateTimestampHTML(html) {
        const now = new Date();
        
        return {
            now: now,
            html: html + `
                <div class="last-updated">
                    <span class="timestamp-label">LAST SCRYING:</span>
                    <span class="timestamp-value">
                        ${now.toLocaleDateString()} ${now.toLocaleTimeString()}
                    </span>
                </div>
            </div>` // Close scoreboard-container
        };
    }

    getNewDate() {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        }).toLowerCase();
        return timestamp;
    }

    retryUpdate() {
        console.log('Retrying quest board update...');
        this.updateScoreboard();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.scoreboard = new Scoreboard();

    // Start auto-update
    scoreboard.startAutoUpdate();
});
