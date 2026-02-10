## ⚔️ ISSessions Fantasy CTF - Guild Quest Board 🛡️

> *"The Quest Giver is watching. The rankings await."*

A high-fantasy themed live scoreboard for CTFd, built for **ISSessions Fantasy CTF 2026**. Features floating magical runes, medieval styling, and immersive D&D-inspired visuals.

![ISSessions Fantasy CTF](assets/img/fantasy-ctf-banner.png)

### 🏰 Features

- **Floating Rune Particles** - Elder Futhark runes drift upward like magical embers
- **Fantasy Terminology** - Teams are "Adventuring Parties", points are "Gold Pieces (GP)", solves are "Quests"
- **Medieval Aesthetic** - Gold, purple, and parchment color scheme with torch-glow effects
- **Responsive Design** - Works on guild halls of all sizes (mobile-friendly)
- **Auto-refresh** - Scries the CTFd API at configurable intervals

### 🗡️ Installation

1. Clone the repository:
```bash
git clone https://github.com/jondmarien/CTFd-Scoreboard.git
```

2. Run locally or via Docker:
```bash
# Local development
python -m http.server 8000

# Docker
docker pull ghcr.io/jondmarien/ctfd-scoreboard:latest
docker run -p 80:80 ghcr.io/jondmarien/ctfd-scoreboard:latest
```

### 📜 Configuration

Create `assets/js/config.js` with your CTFd API credentials:

```javascript
window.CONFIG = {
    API_URL: 'YOUR_CTFD_API_URL',              // e.g., https://ctf.example.com/api/v1/scoreboard
    API_TOKEN: 'YOUR_API_TOKEN',               // CTFd Admin API token
    UPDATE_INTERVAL: 300000,                   // Refresh interval (5 min = 300000ms)
    MAX_TEAMS: 200,                            // Max adventuring parties to display
    FONT_FAMILY: "'Press Start 2P', cursive", // Pixel font for that retro RPG feel
};
```

### 🐉 Credits

- **Theme**: ISSessions Fantasy CTF 2026
- **Original Scoreboard**: Jonathan Marien
- **API**: [CTFd](https://docs.ctfd.io/docs/api/getting-started/)

---

*Enter the Realm. Accept the Quest. 👁️✨*
