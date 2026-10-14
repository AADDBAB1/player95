/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const USERNAME = "root";
const PASSWORD = "toor";

let mediaList = [];
let currentIndex = -1;

let subtitles = [];
let currentSubtitleURL = null;

const video = document.getElementById("video");
const audioDisplay = document.getElementById("audioDisplay");
const audioTitle = document.getElementById("audioTitle");
const subtitleDisplay = document.getElementById("subtitleDisplay");

const playlist = document.getElementById("playlist");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const playButton = document.getElementById("playButton");

const status = document.getElementById("status");
const mediaType = document.getElementById("mediaType");

/* =========================================================
   LOGIN
   ========================================================= */

function login() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const error =
        document.getElementById("errorMessage");

    if (
        username === USERNAME &&
        password === PASSWORD
    ) {

        document.getElementById("loginScreen").style.display =
            "none";

        document.getElementById("playerScreen").style.display =
            "block";

        status.textContent =
            "Login efetuado. Selecione uma mídia.";

    } else {

        error.textContent =
            "Usuário ou senha incorretos!";

        document.getElementById("password").value = "";

    }
}

function clearLogin() {

    document.getElementById("username").value = "";

    document.getElementById("password").value = "";

    document.getElementById("errorMessage").textContent = "";

}

/* Enter para fazer login */

document.getElementById("password")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            login();
        }

    });

document.getElementById("username")
    .addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            login();
        }

    });

/* =========================================================
   ADICIONAR MÍDIA
   ========================================================= */

function addMedia() {

    document.getElementById("mediaFiles").click();

}

function handleMediaFiles(event) {

    const files = Array.from(event.target.files);

    if (!files.length) return;

    files.forEach(file => {

        const type =
            file.type.startsWith("video")
                ? "video"
                : "audio";

        mediaList.push({
            file: file,
            url: URL.createObjectURL(file),
            type: type
        });

    });

    updatePlaylist();

    if (currentIndex === -1) {

        loadMedia(0);

    }

    event.target.value = "";

}

/* =========================================================
   PLAYLIST
   ========================================================= */

function updatePlaylist() {

    playlist.innerHTML = "";

    mediaList.forEach((media, index) => {

        const item =
            document.createElement("div");

        item.className =
            "playlist-item";

        if (index === currentIndex) {
            item.classList.add("active");
        }

        const type =
            media.type === "video"
                ? "MP4"
                : "MP3";

        item.innerHTML =
            `<span class="file-type ${media.type}">
                ${type}
             </span>
             ${escapeHTML(media.file.name)}`;

        item.onclick = function() {
            loadMedia(index);
        };

        playlist.appendChild(item);

    });

}

function clearPlaylist() {

    mediaList.forEach(media => {

        URL.revokeObjectURL(media.url);

    });

    mediaList = [];

    currentIndex = -1;

    video.pause();

    video.removeAttribute("src");

    video.load();

    audioDisplay.style.display = "none";

    subtitleDisplay.textContent = "";

    updatePlaylist();

    status.textContent =
        "Lista de reprodução vazia.";

    mediaType.textContent =
        "Nenhuma mídia";

}

/* =========================================================
   CARREGAR MÍDIA
   ========================================================= */

function loadMedia(index) {

    if (
        index < 0 ||
        index >= mediaList.length
    ) {
        return;
    }

    currentIndex = index;

    const media =
        mediaList[index];

    video.pause();

    video.removeAttribute("src");

    video.load();

    subtitleDisplay.textContent = "";

    if (currentSubtitleURL) {

        URL.revokeObjectURL(
            currentSubtitleURL
        );

        currentSubtitleURL = null;

    }

    subtitles = [];

    if (media.type === "video") {

        video.style.display = "block";

        audioDisplay.style.display = "none";

        video.src = media.url;

        mediaType.textContent =
            "Vídeo";

    } else {

        video.style.display = "none";

        audioDisplay.style.display = "flex";

        audioTitle.textContent =
            media.file.name;

        /*
         * O elemento <video> também consegue
         * reproduzir áudio, portanto usamos
         * o mesmo elemento para ambos.
         */

        video.src = media.url;

        mediaType.textContent =
            "Áudio";

    }

    updatePlaylist();

    status.textContent =
        "Carregado: " + media.file.name;

    video.load();

}

/* =========================================================
   CONTROLES
   ========================================================= */

function togglePlay() {

    if (!video.src) {

        status.textContent =
            "Nenhuma mídia selecionada.";

        return;

    }

    if (video.paused) {

        video.play();

        playButton.textContent = "❚❚";

    } else {

        video.pause();

        playButton.textContent = "▶";

    }

}

function stopMedia() {

    video.pause();

    video.currentTime = 0;

    playButton.textContent = "▶";

}

function previousMedia() {

    if (!mediaList.length) return;

    let index =
        currentIndex - 1;

    if (index < 0) {
        index = mediaList.length - 1;
    }

    loadMedia(index);

    video.play();

}

function nextMedia() {

    if (!mediaList.length) return;

    let index =
        currentIndex + 1;

    if (index >= mediaList.length) {
        index = 0;
    }

    loadMedia(index);

    video.play();

}

/* =========================================================
   PROGRESSO
   ========================================================= */

video.addEventListener("timeupdate", function() {

    if (!video.duration) return;

    progress.value =
        (video.currentTime / video.duration) * 100;

    currentTime.textContent =
        formatTime(video.currentTime);

    updateSubtitle();

});

video.addEventListener("loadedmetadata", function() {

    duration.textContent =
        formatTime(video.duration);

});

progress.addEventListener("input", function() {

    if (!video.duration) return;

    video.currentTime =
        (progress.value / 100) *
        video.duration;

});

volume.addEventListener("input", function() {

    video.volume =
        volume.value;

});

video.addEventListener("play", function() {

    playButton.textContent = "❚❚";

});

video.addEventListener("pause", function() {

    playButton.textContent = "▶";

});

video.addEventListener("ended", function() {

    playButton.textContent = "▶";

    if (mediaList.length > 1) {

        nextMedia();

    }

});

/* =========================================================
   TECLAS DE ATALHO
   ========================================================= */

document.addEventListener("keydown", function(event) {

    /*
     * Não executar atalhos enquanto
     * o usuário estiver digitando no login.
     */

    if (
        document.activeElement.tagName === "INPUT" &&
        document.getElementById("loginScreen").style.display !== "none"
    ) {
        return;
    }

    if (event.code === "Space") {

        event.preventDefault();

        togglePlay();

    }

    if (event.code === "ArrowRight") {

        video.currentTime += 5;

    }

    if (event.code === "ArrowLeft") {

        video.currentTime -= 5;

    }

    if (event.code === "ArrowUp") {

        event.preventDefault();

        video.volume =
            Math.min(1, video.volume + 0.05);

        volume.value =
            video.volume;

    }

    if (event.code === "ArrowDown") {

        event.preventDefault();

        video.volume =
            Math.max(0, video.volume - 0.05);

        volume.value =
            video.volume;

    }

});

/* =========================================================
   LEGENDAS
   ========================================================= */

function addSubtitle() {

    if (!mediaList.length) {

        alert(
            "Primeiro adicione uma música ou vídeo."
        );

        return;

    }

    document.getElementById("subtitleFile").click();

}

async function handleSubtitle(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const text =
        await file.text();

    if (
        file.name.toLowerCase().endsWith(".srt")
    ) {

        subtitles =
            parseSRT(text);

    } else {

        subtitles =
            parseVTT(text);

    }

    status.textContent =
        "Legenda carregada: " +
        file.name;

    event.target.value = "";

}

/* =========================================================
   SRT
   ========================================================= */

function parseSRT(text) {

    const blocks =
        text.replace(/\r/g, "")
            .split(/\n\n+/);

    const result = [];

    blocks.forEach(block => {

        const lines =
            block.split("\n");

        if (lines.length < 2) return;

        let timeLineIndex = 0;

        if (
            !lines[0].includes("-->")
        ) {
            timeLineIndex = 1;
        }

        const timeLine =
            lines[timeLineIndex];

        if (!timeLine || !timeLine.includes("-->")) {
            return;
        }

        const times =
            timeLine.split("-->");

        const start =
            parseSubtitleTime(times[0].trim());

        const end =
            parseSubtitleTime(times[1].trim());

        const caption =
            lines
                .slice(timeLineIndex + 1)
                .join("<br>");

        result.push({
            start: start,
            end: end,
            text: caption
        });

    });

    return result;

}

/* =========================================================
   VTT
   ========================================================= */

function parseVTT(text) {

    const blocks =
        text.replace(/\r/g, "")
            .split(/\n\n+/);

    const result = [];

    blocks.forEach(block => {

        const lines =
            block.split("\n");

        let timeLineIndex =
            lines.findIndex(
                line => line.includes("-->")
            );

        if (timeLineIndex === -1) return;

        const timeLine =
            lines[timeLineIndex];

        const times =
            timeLine.split("-->");

        const start =
            parseSubtitleTime(times[0].trim());

        const end =
            parseSubtitleTime(times[1].trim());

        const caption =
            lines
                .slice(timeLineIndex + 1)
                .join("<br>");

        result.push({
            start: start,
            end: end,
            text: caption
        });

    });

    return result;

}

/* =========================================================
   TEMPO DA LEGENDA
   ========================================================= */

function parseSubtitleTime(time) {

    time =
        time.replace(",", ".");

    const parts =
        time.split(":");

    if (parts.length === 3) {

        return (
            parseFloat(parts[0]) * 3600 +
            parseFloat(parts[1]) * 60 +
            parseFloat(parts[2])
        );

    }

    if (parts.length === 2) {

        return (
            parseFloat(parts[0]) * 60 +
            parseFloat(parts[1])
        );

    }

    return 0;

}

/* =========================================================
   EXIBIR LEGENDA
   ========================================================= */

function updateSubtitle() {

    if (!subtitles.length) {

        subtitleDisplay.textContent = "";

        return;

    }

    const time =
        video.currentTime;

    const subtitle =
        subtitles.find(
            sub =>
                time >= sub.start &&
                time <= sub.end
        );

    if (subtitle) {

        subtitleDisplay.innerHTML =
            subtitle.text;

    } else {

        subtitleDisplay.innerHTML = "";

    }

}

/* =========================================================
   TELA CHEIA
   ========================================================= */

let controlsHideTimer = null;
const playerWindow = document.querySelector(".player-window");

function showFullscreenControls() {
    if (!document.fullscreenElement || document.fullscreenElement !== playerWindow) return;

    playerWindow.classList.remove("controls-hidden");
    clearTimeout(controlsHideTimer);

    controlsHideTimer = setTimeout(() => {
        if (document.fullscreenElement === playerWindow) {
            playerWindow.classList.add("controls-hidden");
        }
    }, 5000);
}

function exitFullscreen() {
    clearTimeout(controlsHideTimer);
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        const request = playerWindow.requestFullscreen();
        if (request && typeof request.then === "function") {
            request.then(() => {
                showFullscreenControls();
                // Alguns navegadores móveis permitem bloquear a orientação em tela cheia.
                if (screen.orientation && screen.orientation.lock) {
                    screen.orientation.lock("portrait").catch(() => {});
                }
            }).catch(() => {
                status.textContent = "Não foi possível ativar a tela cheia neste navegador.";
            });
        }
    } else {
        clearTimeout(controlsHideTimer);
        document.exitFullscreen();
    }
}

playerWindow.addEventListener("pointerdown", () => {
    if (document.fullscreenElement === playerWindow) showFullscreenControls();
});
playerWindow.addEventListener("mousemove", () => {
    if (document.fullscreenElement === playerWindow) showFullscreenControls();
});
document.addEventListener("fullscreenchange", () => {
    clearTimeout(controlsHideTimer);
    if (document.fullscreenElement === playerWindow) {
        showFullscreenControls();
    } else {
        playerWindow.classList.remove("controls-hidden");
        if (screen.orientation && screen.orientation.unlock) {
            try { screen.orientation.unlock(); } catch (error) {}
        }
    }
});

/* =========================================================
   AJUDA
   ========================================================= */

function showAbout() {

    alert(
        "Windows 95 Media Player\n\n" +
        "Player retrô desenvolvido em HTML, CSS e JavaScript.\n\n" +
        "Usuário: root\n" +
        "Senha: toor\n\n" +
        "Suporta múltiplos arquivos de áudio/vídeo " +
        "e legendas SRT/VTT."
    );

}

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    seconds =
        Math.floor(seconds);

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );

}

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

video.volume = 1;
