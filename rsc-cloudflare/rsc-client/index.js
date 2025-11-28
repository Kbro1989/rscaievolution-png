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

    // Mobile input helper - only show if mobile mode is enabled
    if (isMobile) {
        const inputHelper = document.createElement('button');
        inputHelper.innerText = '⌨️ Tap to Type';
        inputHelper.style.position = 'absolute';
        inputHelper.style.bottom = '10px';
        inputHelper.style.left = '50%';
        inputHelper.style.transform = 'translateX(-50%)';
        inputHelper.style.padding = '10px 20px';
        inputHelper.style.background = 'rgba(0, 0, 0, 0.7)';
        inputHelper.style.color = '#fff';
        inputHelper.style.border = '2px solid #fff';
        inputHelper.style.borderRadius = '5px';
        inputHelper.style.fontSize = '16px';
        inputHelper.style.zIndex = '1001';
        inputHelper.style.cursor = 'pointer';
        
        inputHelper.onclick = () => {
            const text = prompt('Enter text:');
            if (text !== null && mc.focusControlIndex >= 0) {
                // Send text to the focused control
                for (let i = 0; i < text.length; i++) {
                    mc.keyPressed({ keyCode: text.charCodeAt(i), key: text[i] });
                }
            }
        };
        
        mcContainer.appendChild(inputHelper);
    }

    await mc.startApplication(512, 346, 'Runescape by Andrew Gower');
})();
