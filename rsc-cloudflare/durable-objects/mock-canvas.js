module.exports = {
    createCanvas: () => ({
        getContext: () => ({
            fillRect: () => { },
            getImageData: () => ({ data: [] }),
            putImageData: () => { },
            drawImage: () => { },
            save: () => { },
            restore: () => { },
            translate: () => { },
            rotate: () => { },
            scale: () => { },
            msg: 'Canvas mocked'
        }),
        toBuffer: () => Buffer.from([])
    }),
    loadImage: async () => ({})
};
