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

    await mc.startApplication(512, 346, 'Runescape by Andrew Gower');
})();
