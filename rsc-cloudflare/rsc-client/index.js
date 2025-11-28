const mudclient = require('./src/mudclient');

if (typeof window === 'undefined') {
    throw new Error('rsc-client needs to run in a browser');
}

(async () => {
    const mcContainer = document.createElement('div');
    const args = window.location.hash.slice(1).split(',');
    const mc = new mudclient(mcContainer);

    window.mcOptions = mc.options;

    Object.assign(mc.options, {
        middleClickCamera: true,
        mouseWheel: true,
        resetCompass: true,
        zoomCamera: true,
        accountManagement: true,
        mobile: true
    });

    mc.members = args[0] === 'members';
    
    if (!args[1]) {
        console.log('Initializing standalone server worker...');
        const serverWorker = new Worker('./server.bundle.min.js');
        serverWorker.postMessage({
            type: 'start',
            config: {
                worldID: 1,
                version: 204,
                members: false,
                experienceRate: 1,
                fatigue: true,
                rememberCombatStyle: false
            }
        });
        mc.server = serverWorker;
    } else {
        mc.server = args[1];
        mc.port = args[2] && !isNaN(+args[2]) ? +args[2] : 43595;
    }

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

    // Keyboard toggle button
    const keyboardToggle = document.createElement('div');
    keyboardToggle.innerHTML = '&#9650;'; // Up arrow
    keyboardToggle.style.position = 'absolute';
    keyboardToggle.style.bottom = '10px';
    keyboardToggle.style.right = '10px'; // Bottom right
    keyboardToggle.style.width = '40px';
    keyboardToggle.style.height = '40px';
    keyboardToggle.style.background = 'rgba(0, 0, 0, 0.5)';
    keyboardToggle.style.border = '2px solid #fff';
    keyboardToggle.style.borderRadius = '50%';
    keyboardToggle.style.color = '#fff';
    keyboardToggle.style.fontSize = '20px';
    keyboardToggle.style.display = 'flex';
    keyboardToggle.style.justifyContent = 'center';
    keyboardToggle.style.alignItems = 'center';
    keyboardToggle.style.cursor = 'pointer';
    keyboardToggle.style.zIndex = '1000';
    keyboardToggle.style.userSelect = 'none';
    
    let keyboardOpen = false;
    keyboardToggle.onclick = () => {
        if (keyboardOpen) {
            mc.closeKeyboard();
            keyboardToggle.innerHTML = '&#9650;'; // Up arrow
            keyboardOpen = false;
        } else {
            // Open keyboard for text input
            mc.openKeyboard('text', '', 100, { 
                bottom: '0px', 
                left: '0px', 
                width: '100%', 
                height: '50px',
                opacity: '0' // Keep it invisible but focusable
            });
            
            // Explicitly focus the input to trigger native keyboard
            if (mc.mobileInput) {
                mc.mobileInput.focus();
            }

            keyboardToggle.innerHTML = '&#9660;'; // Down arrow
            keyboardOpen = true;
        }
    };
    mcContainer.appendChild(keyboardToggle);

    await mc.startApplication(512, 346, 'Runescape by Andrew Gower');
})();
