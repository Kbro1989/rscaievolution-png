const mudclient = require('./src/mudclient');

if (typeof window === 'undefined') {
    throw new Error('rsc-client needs to run in a browser');
}

(async () => {
    const mcContainer = document.createElement('div');
    const args = window.location.hash.slice(1).split(',');
    const mc = new mudclient(mcContainer);

    window.mcOptions = mc.options;

    // Detect if user is on a mobile/touch device (conservative approach)
    // Only enable mobile mode if user agent indicates mobile AND not a desktop OS
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isDesktopOS = /win|mac|linux|cros/i.test(userAgent);

    // Allow URL parameter to override: ?mobile=true or ?mobile=false
    const urlParams = new URLSearchParams(window.location.search);
    const mobileParam = urlParams.get('mobile');

    let isMobile;
    if (mobileParam !== null) {
        isMobile = mobileParam === 'true';
    } else {
        isMobile = isMobileUA && !isDesktopOS;
    }

    Object.assign(mc.options, {
        middleClickCamera: true,
        mouseWheel: true,
        resetCompass: true,
        zoomCamera: true,
        accountManagement: true,
        mobile: isMobile
    });

    // Ensure audio initializes on first user click (browser autoplay requirement)
    // Ensure audio initializes on first user click (browser autoplay requirement)
    const initAudio = () => {
        if (mc.audioPlayer) {
            console.log('%c Audio Player Active ', 'background: #222; color: #00ff00; font-size: 16px');
            // Resume audio context if it's suspended (browser autoplay policy)
            if (mc.audioPlayer.audioContext && mc.audioPlayer.audioContext.state === 'suspended') {
                mc.audioPlayer.audioContext.resume().then(() => {
                    console.log('Audio context resumed');
                });
            }
            // Only remove listener once we've successfully found and initialized the player
            document.removeEventListener('click', initAudio);
        } else {
            console.log('%c Waiting for Audio Player... ', 'background: #222; color: #ffaa00; font-size: 16px');
            // Do NOT remove listener yet, try again on next click
        }
    };
    document.addEventListener('click', initAudio);

    // Force members mode enabled by default
    mc.members = true; // args[0] === 'members';

    // Check for multiplayer mode via query param
    // Default to Multiplayer (Fly.io) unless mode=solo
    const modeParam = urlParams.get('mode');
    const isMultiplayer = modeParam !== 'solo';

    // FORCE MULTIPLAYER MODE
    console.log('🌐 Multiplayer Mode Active');

    // Detect Localhost OR Private Network IPs (RFC 1918)
    const isLocal = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.match(/^192\.168\./) ||
        window.location.hostname.match(/^10\./) ||
        window.location.hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./);

    if (isLocal) {
        console.log(`🌐 Local Dev mode - connecting to local Worker (${window.location.hostname}:8787)...`);
        mc.server = window.location.hostname; // Connect to same IP
        mc.port = 8787;
    } else {
        console.log('🌐 Production mode - connecting to Cloudflare Worker...');

        // Production: Hardcoded Cloudflare Worker URL
        const PROD_WORKER_URL = 'rscaievolution-png.kristain33rs.workers.dev';

        console.log(`Using Production Worker: ${PROD_WORKER_URL}`);
        mc.server = PROD_WORKER_URL;
        mc.port = 443;
    }
    // Solo and Custom logic removed for Multiplayer-only build

    mc.threadSleep = 10;

    document.body.appendChild(mcContainer);

    // Fullscreen button
    const fullscreen = document.createElement('button');
    fullscreen.innerText = 'Fullscreen';
    fullscreen.style.position = 'absolute';
    fullscreen.style.top = '10px';
    fullscreen.style.right = '10px';
    fullscreen.style.zIndex = '1000';
    fullscreen.onclick = () => {
        mcContainer.requestFullscreen();
    };
    mcContainer.appendChild(fullscreen);

    // Virtual keyboard (always available for testing)
    const keyboard = document.createElement('div');
    keyboard.style.position = 'fixed';
    keyboard.style.bottom = '-300px';
    keyboard.style.left = '0';
    keyboard.style.width = '100%';
    keyboard.style.background = 'rgba(30, 30, 30, 0.95)';
    keyboard.style.padding = '10px';
    keyboard.style.transition = 'bottom 0.3s ease';
    keyboard.style.zIndex = '2000';
    keyboard.style.display = 'grid';
    keyboard.style.gridTemplateColumns = 'repeat(10, 1fr)';
    keyboard.style.gap = '5px';
    keyboard.style.maxWidth = '600px';
    keyboard.style.margin = '0 auto';

    const keys = [
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
        'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '⌫',
        'z', 'x', 'c', 'v', 'b', 'n', 'm', '@', '.', '↵'
    ];

    keys.forEach(key => {
        const btn = document.createElement('button');
        btn.innerText = key;
        btn.style.padding = '15px 5px';
        btn.style.background = '#444';
        btn.style.color = '#fff';
        btn.style.border = '1px solid #666';
        btn.style.borderRadius = '5px';
        btn.style.fontSize = '18px';
        btn.style.cursor = 'pointer';

        btn.onclick = () => {
            if (key === '⌫') {
                mc.keyPressed({ keyCode: 8 }); // Backspace
            } else if (key === '↵') {
                mc.keyPressed({ keyCode: 13 }); // Enter
            } else {
                mc.keyPressed({ key: key, keyCode: key.charCodeAt(0) });
            }
        };

        keyboard.appendChild(btn);
    });

    document.body.appendChild(keyboard);

    // Keyboard toggle button (mirrors fullscreen button at top-left)
    const toggleBtn = document.createElement('button');
    toggleBtn.innerText = 'Keyboard';
    toggleBtn.style.position = 'absolute';
    toggleBtn.style.top = '10px';
    toggleBtn.style.left = '10px';
    toggleBtn.style.zIndex = '1000';
    toggleBtn.style.cursor = 'pointer';

    let keyboardVisible = false;
    toggleBtn.onclick = () => {
        keyboardVisible = !keyboardVisible;
        keyboard.style.bottom = keyboardVisible ? '0' : '-300px';
        toggleBtn.innerText = keyboardVisible ? 'Hide Keyboard' : 'Keyboard';
    };

    mcContainer.appendChild(toggleBtn);

    await mc.startApplication(512, 346, 'Runescape by Andrew Gower');
})();
