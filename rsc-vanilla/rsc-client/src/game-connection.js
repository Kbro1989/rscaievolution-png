const Color = require('./lib/graphics/color');
const Font = require('./lib/graphics/font');
const GameShell = require('./game-shell');
const Long = require('long');
const PacketStream = require('./packet-stream');
const Socket = require('./lib/net/socket');
const Utility = require('./utility');
const clientOpcodes = require('./opcodes/client');
const sleep = require('sleep-promise');

function fromCharArray(a) {
    return Array.from(a)
        .map((c) => String.fromCharCode(c))
        .join('');
}

class GameConnection extends GameShell {
    constructor(canvas) {
        super(canvas);

        this.friendListCount = 0;
        this.ignoreListCount = 0;
        this.settingsBlockChat = 0;
        this.settingsBlockPrivate = 0;
        this.settingsBlockTrade = 0;
        this.settingsBlockDuel = 0;
        this.sessionID = new Long(0);
        this.worldFullTimeout = 0;
        this.moderatorLevel = 0;
        this.autoLoginTimeout = 0;
        this.packetLastRead = 0;
        this.messageIndex = 0;

        // Auto-detect server based on environment
        const isLocal = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1');

        if (isLocal) {
            // Local development
            this.server = window.location.hostname;
            this.port = parseInt(window.location.port) || 8788;
        } else {
            // Production - Cloudflare Pages
            this.server = 'rscaievolution-png.pages.dev';
            this.port = 443;
        }

        this.username = '';
        this.password = '';

        this.incomingPacket = new Int8Array(5000);

        this.friendListOnline = new Int32Array(200);
        this.friendListHashes = [];

        for (let i = 0; i < 200; i += 1) {
            this.friendListHashes.push(new Long(0));
        }

        this.ignoreList = [];

        for (let i = 0; i < GameConnection.maxSocialListSize; i += 1) {
            this.ignoreList.push(new Long(0));
        }

        this.messageTokens = new Int32Array(GameConnection.maxSocialListSize);
    }

    async register(username, password) {
        if (this.worldFullTimeout > 0) {
            this.showLoginScreenStatus(
                'Please wait...',
                'Connecting to server'
            );

            await sleep(2000);

            this.showLoginScreenStatus(
                'Sorry! The server is currently full.',
                'Please try again later'
            );

            return;
        }

        try {
            username = Utility.formatAuthString(username, 20);
            password = Utility.formatAuthString(password, 20);

            this.showLoginScreenStatus(
                'Please wait...',
                'Connecting to server'
            );

            let socket;
            if (this.server instanceof Worker) {
                socket = new Socket(this.server);
                await socket.connect();
            } else {
                socket = await this.createSocket(this.server, this.port);
                await socket.connect();
            }

            this.packetStream = new PacketStream(socket, this);

            console.log('Connected! Waiting for auth_required to register...');

            // JSON Auth Flow for Registration
            const authResult = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Auth timeout')), 10000);

                socket.onJSONMessage = (msg) => {
                    console.log('Client received JSON (register):', msg);
                    if (msg.type === 'auth_required') {
                        console.log('Sending register...');
                        socket.sendJSON({
                            type: 'register',
                            username: username,
                            password: password,
                            email: 'temp@example.com' // Placeholder
                        });
                    } else if (msg.type === 'register_success') {
                        clearTimeout(timeout);
                        resolve(msg);
                    } else if (msg.type === 'register_failure') {
                        clearTimeout(timeout);
                        reject(new Error(msg.reason || 'Registration failed'));
                    }
                };
            });

            console.log('Registration successful:', authResult);
            this.resetLoginVars();

        } catch (e) {
            console.error('Registration error:', e);

            this.showLoginScreenStatus(
                'Error unable to create user.',
                e.message
            );
        }
    }

    async login(username, password, reconnecting) {
        if (this.worldFullTimeout > 0) {
            this.showLoginScreenStatus(
                'Please wait...',
                'Connecting to server'
            );

            await sleep(2000);

            this.showLoginScreenStatus(
                'Sorry! The server is currently full.',
                'Please try again later'
            );

            return;
        }

        try {
            this.username = username;
            username = Utility.formatAuthString(username, 20);

            this.password = password;
            password = Utility.formatAuthString(password, 20);

            if (username.trim().length === 0) {
                this.showLoginScreenStatus(
                    'You must enter both a username',
                    'and a password - Please try again'
                );
                return;
            }

            if (reconnecting) {
                this.drawTextBox(
                    'Connection lost! Please wait...',
                    'Attempting to re-establish'
                );
            } else {
                this.showLoginScreenStatus(
                    'Please wait...',
                    'Connecting to server'
                );
            }

            let socket;
            if (this.server instanceof Worker) {
                socket = new Socket(this.server);
                await socket.connect();
            } else {
                socket = await this.createSocket(this.server, this.port);
                await socket.connect();
            }

            this.packetStream = new PacketStream(socket, this);
            this.packetStream.maxReadTries = GameConnection.maxReadTries;

            console.log('Connected! Waiting for auth_required...');

            // JSON Auth Flow
            const authResult = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Auth timeout')), 10000);

                socket.onJSONMessage = (msg) => {
                    console.log('Client received JSON:', msg);
                    if (msg.type === 'auth_required') {
                        console.log('Sending login...');
                        socket.sendJSON({
                            type: 'login',
                            username: this.username,
                            password: this.password
                        });
                    } else if (msg.type === 'login_success') {
                        clearTimeout(timeout);
                        resolve(msg);
                    } else if (msg.type === 'login_failure') {
                        clearTimeout(timeout);
                        reject(new Error(msg.reason || 'Login failed'));
                    }
                };
            });

            console.log('Login successful:', authResult);

            // Set session vars
            this.moderatorLevel = 0; // todo: get from authResult
            this.autoLoginTimeout = 0;
            this.resetGame();

            return;

        } catch (e) {
            console.error('Login error:', e);

            this.showLoginScreenStatus(
                'Error unable to login.',
                e.message
            );
        }

        if (this.autoLoginTimeout > 0) {
            await sleep(5000);
            this.autoLoginTimeout--;
            await this.login(this.username, this.password, reconnecting);
        }

        if (reconnecting) {
            this.username = '';
            this.password = '';
            this.resetLoginVars();
        } else {
            this.showLoginScreenStatus(
                'Sorry! Unable to connect.',
                'Check internet settings or try another world'
            );
        }
    }

    async recoverAttempt(username) {
        this.showLoginScreenStatus('Please wait...', 'Connecting to server');

        try {
            if (this.server instanceof Worker) {
                const socket = new Socket(this.server);
                await socket.connect();
                this.packetStream = new PacketStream(socket, this);
            } else {
                this.packetStream = new PacketStream(
                    await this.createSocket(this.server, this.port),
                    this
                );
            }

            this.packetStream.maxReadTries = this.maxReadTries;
            this.packetStream.newPacket();
            this.packetStream.putLong(Utility.usernameToHash(username));
            this.packetStream.flushPacket();

            const response = await this.packetStream.readStream();
            console.log('Getpq response: ' + response);

            if (response === 0) {
                this.showLoginScreenStatus(
                    'Sorry, the recovery questions for this user have not ' +
                    'been set',
                    ''
                );

                return;
            }

            for (let i = 0; i < 5; i++) {
                const length = await this.packetStream.readStream();

                if (length < 0) {
                    throw new Error('invalid recovery question length');
                }

                const buffer = new Int8Array(length);
                await this.packetStream.readBytes(length, buffer);
                const question = fromCharArray(buffer.slice(0, length));

                this.panelRecoverUser.updateText(
                    this.controlRecoverQuestions[i],
                    question
                );
            }

            if (this.recentRecoverFail) {
                this.showLoginScreenStatus(
                    'Sorry, you have already attempted 1 recovery, try again ' +
                    'later',
                    ''
                );

                return;
            }

            this.loginScreen = 3;

            this.panelRecoverUser.updateText(
                this.controlRecoverInfo1,
                '@yel@To prove this is your account please provide the ' +
                'answers to'
            );

            this.panelRecoverUser.updateText(
                this.controlRecoverInfo2,
                '@yel@your security questions. You will then be able to ' +
                'reset your password'
            );

            for (let i = 0; i < 5; i++) {
                this.panelRecoverUser.updateText(
                    this.controlRecoverAnswers[i],
                    ''
                );
            }

            this.panelRecoverUser.updateText(
                this.controlRecoverOldPassword,
                ''
            );
            this.panelRecoverUser.updateText(
                this.controlRecoverNewPassword,
                ''
            );
            this.panelRecoverUser.updateText(
                this.controlRecoverConfirmPassword,
                ''
            );
        } catch (e) {
            console.error(e);

            this.showLoginScreenStatus(
                'Sorry! Unable to connect.',
                'Check leternet settings or try another world'
            );

            return;
        }
    }

    closeConnection() {
        if (this.packetStream !== null) {
            try {
                this.packetStream.newPacket(clientOpcodes.CLOSE_CONNECTION);
                this.packetStream.flushPacket();
            } catch (e) {
                console.error(e);
            }
        }

        this.username = '';
        this.password = '';

        this.resetLoginVars();
    }

    async lostConnection() {
        try {
            throw new Error('');
        } catch (e) {
            console.error(e);
        }

        if (this.options.retryLoginOnDisconnect) {
            this.autoLoginTimeout = 10;
        }

        await this.login(this.username, this.password, true);
    }

    drawTextBox(top, bottom) {
        const graphics = this.getGraphics();
        const font = new Font('Helvetica', 1, 15);
        const width = 512;
        const height = 344;

        graphics.setColor(Color.black);

        graphics.fillRect(
            ((width / 2) | 0) - 140,
            ((height / 2) | 0) - 25,
            280,
            50
        );

        graphics.setColor(Color.white);

        graphics.drawRect(
            ((width / 2) | 0) - 140,
            ((height / 2) | 0) - 25,
            280,
            50
        );

        this.drawString(
            graphics,
            top,
            font,
            (width / 2) | 0,
            ((height / 2) | 0) - 10
        );

        this.drawString(
            graphics,
            bottom,
            font,
            (width / 2) | 0,
            ((height / 2) | 0) + 10
        );
    }

    async checkConnection() {
        // packetTick?
        const timestamp = Date.now();

        if (this.packetStream.hasPacket()) {
            this.packetLastRead = timestamp;
        }

        if (timestamp - this.packetLastRead > 5000) {
            this.packetLastRead = timestamp;
            // this.packetStream.newPacket(clientOpcodes.PING);
            // this.packetStream.sendPacket();
            if (this.packetStream && this.packetStream.socket) {
                try {
                    this.packetStream.socket.sendJSON({ type: 'ping' });
                } catch (e) {
                    // ignore
                }
            }
        }

        try {
            this.packetStream.writePacket(20);
        } catch (e) {
            await this.lostConnection();
            return;
        }

        const length = await this.packetStream.readPacket(this.incomingPacket);

        if (length > 0) {
            const opcode = this.packetStream.isaacCommand(
                this.incomingPacket[0] & 0xff
            );

            //console.log('opcode:' + opcode + ' psize:' + length);
            this.handleIncomingPacket(opcode, length, this.incomingPacket);
        }
    }

    sortFriendsList() {
        let flag = true;

        while (flag) {
            flag = false;

            for (let i = 0; i < this.friendListCount - 1; i++) {
                if (
                    (this.friendListOnline[i] !== 255 &&
                        this.friendListOnline[i + 1] === 255) ||
                    (this.friendListOnline[i] === 0 &&
                        this.friendListOnline[i + 1] !== 0)
                ) {
                    const onlineStatus = this.friendListOnline[i];
                    this.friendListOnline[i] = this.friendListOnline[i + 1];
                    this.friendListOnline[i + 1] = onlineStatus;

                    const encodedUsername = this.friendListHashes[i];
                    this.friendListHashes[i] = this.friendListHashes[i + 1];
                    this.friendListHashes[i + 1] = encodedUsername;

                    flag = true;
                }
            }
        }
    }

    sendPrivacySettings(chat, privateChat, trade, duel) {
        this.packetStream.newPacket(clientOpcodes.SETTINGS_PRIVACY);
        this.packetStream.putByte(chat);
        this.packetStream.putByte(privateChat);
        this.packetStream.putByte(trade);
        this.packetStream.putByte(duel);
        this.packetStream.sendPacket();
    }

    ignoreAdd(username) {
        const encodedUsername = Utility.usernameToHash(username);

        this.packetStream.newPacket(clientOpcodes.IGNORE_ADD);
        this.packetStream.putLong(encodedUsername);
        this.packetStream.sendPacket();

        for (let i = 0; i < this.ignoreListCount; i++) {
            if (this.ignoreList[i].equals(encodedUsername)) {
                return;
            }
        }

        if (this.ignoreListCount >= GameConnection.maxSocialListSize) {
            return;
        } else {
            this.ignoreList[this.ignoreListCount++] = encodedUsername;
            return;
        }
    }

    ignoreRemove(encodedUsername) {
        this.packetStream.newPacket(clientOpcodes.IGNORE_REMOVE);
        this.packetStream.putLong(encodedUsername);
        this.packetStream.sendPacket();

        for (let i = 0; i < this.ignoreListCount; i++) {
            if (this.ignoreList[i].equals(encodedUsername)) {
                this.ignoreListCount--;

                for (let j = i; j < this.ignoreListCount; j++) {
                    this.ignoreList[j] = this.ignoreList[j + 1];
                }

                return;
            }
        }
    }

    friendAdd(username) {
        this.packetStream.newPacket(clientOpcodes.FRIEND_ADD);
        this.packetStream.putLong(Utility.usernameToHash(username));
        this.packetStream.sendPacket();

        const encodedUsername = Utility.usernameToHash(username);

        for (let i = 0; i < this.friendListCount; i++) {
            if (this.friendListHashes[i].equals(encodedUsername)) {
                return;
            }
        }

        if (this.friendListCount >= GameConnection.maxSocialListSize) {
            return;
        } else {
            this.friendListHashes[this.friendListCount] = encodedUsername;
            this.friendListOnline[this.friendListCount] = 0;
            this.friendListCount++;
            return;
        }
    }

    friendRemove(encodedUsername) {
        this.packetStream.newPacket(clientOpcodes.FRIEND_REMOVE);
        this.packetStream.putLong(encodedUsername);
        this.packetStream.sendPacket();

        for (let i = 0; i < this.friendListCount; i++) {
            if (!this.friendListHashes[i].equals(encodedUsername)) {
                continue;
            }

            this.friendListCount--;

            for (let j = i; j < this.friendListCount; j++) {
                this.friendListHashes[j] = this.friendListHashes[j + 1];
                this.friendListOnline[j] = this.friendListOnline[j + 1];
            }

            break;
        }

        this.showServerMessage(
            `@pri@${Utility.hashToUsername(encodedUsername)} has been ` +
            'removed from your friends list'
        );
    }

    sendPrivateMessage(username, message, length) {
        this.packetStream.newPacket(clientOpcodes.PM);
        this.packetStream.putLong(username);
        this.packetStream.putBytes(message, 0, length);
        this.packetStream.sendPacket();
    }

    sendChatMessage(message, length) {
        this.packetStream.newPacket(clientOpcodes.CHAT);
        this.packetStream.putBytes(message, 0, length);
        this.packetStream.sendPacket();
    }

    sendCommandString(command) {
        this.packetStream.newPacket(clientOpcodes.COMMAND);
        this.packetStream.putString(command);
        this.packetStream.sendPacket();
    }
}

GameConnection.clientVersion = 1;
GameConnection.maxReadTries = 0;
GameConnection.maxSocialListSize = 100;

module.exports = GameConnection;
