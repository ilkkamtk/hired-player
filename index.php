<?php
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("X-Frame-Options: DENY");
header("Permissions-Policy: camera=(), microphone=(), geolocation=()");
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'sha256-NBfyYgxoWTkJ9SyHWLNVIq8UkKGvsaGPAaGmNMpVMSA='; img-src 'self' data:; media-src 'self'; connect-src 'self' https://unpkg.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MP3 Player</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" integrity="sha384-xyQ/Vpt1cq1pdPYlRaT/QkcSj2vrYyWI3WOhxGBzqnP1vgvsS2yrhWXe3/wIoCr5" crossorigin="anonymous"></script>
    <script nomodule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" integrity="sha384-KAUcUASKfGZ0sxENVFRiH12jtpvd9SsVpgzvYdvv8ZMLqB99G3gX3DAts418wzIC" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Reenaa si, saatana</h1>
    <div class="tabs">
        <?php
        $instruments = ['kitara', 'kiipparit', 'laulu', 'basso', 'rummut'];
foreach ($instruments as $inst) {
    echo "<button class='tab-button' data-tab='$inst'>" . ucfirst(htmlspecialchars($inst, ENT_QUOTES, 'UTF-8')) . "</button>";
}
?>
    </div>
    <?php
    foreach ($instruments as $inst) {
        echo "<div class='tab-content' id='$inst-tab'>";
        $files = glob("mp3/$inst/*.{mp3,MP3}", GLOB_BRACE);
        if (empty($files)) {
            echo "<p>No MP3 files found in " . htmlspecialchars($inst, ENT_QUOTES, 'UTF-8') . " folder.</p>";
        } else {
            echo "<div class='file-picker'>";
            echo "<select class='file-select' aria-label='" . htmlspecialchars($inst, ENT_QUOTES, 'UTF-8') . " files'>";
            echo "<option value=''>Valitse tiedosto…</option>";
            foreach ($files as $file) {
                $filename = basename($file);
                echo "<option value='" . htmlspecialchars($file, ENT_QUOTES, 'UTF-8') . "'>" . htmlspecialchars($filename, ENT_QUOTES, 'UTF-8') . "</option>";
            }
            echo "</select>";
            echo "</div>";
        }
        echo "</div>";
    }
?>
    <div class="player" id="player">
        <audio id="audio" controls></audio>
        <div class="player-progress">
            <input type="range" id="progress" value="0" min="0" step="0.1" aria-label="Progress">
            <div class="player-time">
                <span id="current-time">0:00</span>
                <span id="duration">0:00</span>
            </div>
        </div>

        <div class="player-controls" aria-label="Playback controls">
            <button id="rewind" class="player-btn" aria-label="Rewind 10 seconds">
                <ion-icon name="play-back" aria-hidden="true"></ion-icon>
            </button>
            <button id="play-pause" class="player-btn player-btn--primary" aria-label="Play">
                <ion-icon id="play-pause-icon" name="play" aria-hidden="true"></ion-icon>
            </button>
            <button id="forward" class="player-btn" aria-label="Forward 10 seconds">
                <ion-icon name="play-forward" aria-hidden="true"></ion-icon>
            </button>
        </div>
    </div>
    <div class="mixer" id="drums-mixer" hidden>
        <div class="channel">
            <label for="left-volume">Musiikki</label>
            <div class="fader">
                <input type="range" orient="vertical" id="left-volume" min="0" max="1" step="0.01" value="1">
            </div>
        </div>
        <div class="channel">
            <label for="right-volume">Klikki</label>
            <div class="fader">
                <input type="range" orient="vertical" id="right-volume" min="0" max="1" step="0.01" value="1">
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>