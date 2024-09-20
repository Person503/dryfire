const content = document.getElementById('content');

const pages = {
    home: `
        <div class="profile">
            <h1>Dry Fire Buddy</h1>
            <p>Your ultimate companion for USPSA dry fire training</p>
        </div>

        <div class="buttons">
            <button class="btn btn-secondary" onclick="loadPage('learn')">Learn more</button>
        </div>

        <div class="recent-items">
            <h2>Training Tools</h2>
            <a href="#par" class="recent-item">
                <img src="PARTIMER.png" alt="Par Timer">
                <div>
                    <h3>Par Timer</h3>
                    <p>Customizable par timer for precision training</p>
                </div>
                <div class="arrow"></div>
            </a>
            <a href="#uspsasim" class="recent-item">
                <img src="uspsasim.png" alt="USPSA Simulator">
                <div>
                    <h3>USPSA Simulator</h3>
                    <p>Simulate USPSA stages for realistic practice</p>
                </div>
                <div class="arrow"></div>
            </a>
            <a href="#timer" class="recent-item">
                <img src="timer.png" alt=" Timer">
                <div>
                    <h3> Timer</h3>
                    <p>Accurate timing for performance tracking with beeps</p>
                </div>
                <div class="arrow"></div>
            </a>
        </div>
    `,
    par: `
        <div class="profile">
            <h1>USPSA Training Timer</h1>
            <p>A customizable par timer for USPSA training</p>
        </div>

        <div class="recent-items timer-section">
            <h2>Par Timer</h2>
            <div class="settings">
                <div class="setting-item">
                    <label for="parTime">Par Time (s)</label>
                    <input type="number" id="parTime" value="3" min="0" step="0.1" max="99.9">
                </div>
                <div class="setting-item">
                    <label for="delayTime">Delay Time (s)</label>
                    <input type="number" id="delayTime" value="2" min="0" step="0.1" max="99.9">
                </div>
                <div class="setting-item">
                    <label for="reps">Number of Reps</label>
                    <input type="number" id="reps" value="3" min="1" step="1" max="99">
                </div>
            </div>
            <div id="timer">0.00</div>
            <div class="buttons">
                <button id="startBtn" class="btn btn-primary">Start</button>
                <button id="stopBtn" class="btn btn-secondary" disabled>Stop</button>
                <button id="resetBtn" class="btn btn-secondary">Reset</button>
            </div>
            <p id="voiceCommandInfo" style="text-align: center; margin-top: 10px;">
                Enable voice commands and say "Start", "Stop", or "Reset" to control the timer.
            </p>
        </div>

        <audio id="startBeep" src="startbeep.wav"></audio>
        <audio id="nextSetBeep" src="next set.m3"></audio>
        <audio id="setEndBeep" src="setend"></audio>
    `,
    uspsasim: `
        <div class="profile">
            <h1>USPSA Simulator</h1>
            <p>Practice your reaction time with random start delays</p>
        </div>

        <div class="recent-items timer-section">
            <h2>Random Start Timer</h2>
            <div id="timer">0.00</div>
            <div class="buttons">
                <button id="startBtn" class="btn btn-primary">Start</button>
                <button id="resetBtn" class="btn btn-secondary">Reset</button>
                <button id="stopBtn" class="btn btn-primary" disabled>Stop</button>
            </div>
            <p id="voiceCommandInfo" style="text-align: center; margin-top: 10px;">
                Enable voice commands and say "Start", "Stop", or "Reset" to control the timer.
            </p>
        </div>

        <audio id="startBeep" src="startbeep.wav"></audio>
        <audio id="setEndBeep" src="setend.mp3"></audio>
    `,
    timer: `
        <div class="profile">
            <h1>Timer</h1>
            <p>Accurate timing for performance tracking with beeps</p>
        </div>

        <div class="recent-items timer-section">
            <h2>Timer</h2>
            <div id="timer">00:00.00</div>
            <div class="buttons">
                <button id="startBtn" class="btn btn-primary">Start</button>
                <button id="resetBtn" class="btn btn-secondary">Reset</button>
                <button id="stopBtn" class="btn btn-primary" disabled>Stop</button>
            </div>
            <p id="voiceCommandInfo" style="text-align: center; margin-top: 10px;">
                Enable voice commands and say "Start", "Stop", or "Reset" to control the timer.
            </p>
        </div>

        <audio id="startBeep" src="startbeep.wav"></audio>
        <audio id="setEndBeep" src="setend.mp3"></audio>
    `,
    learn: `
        <h1>Learn More</h1>
        <p><p>Dry Fire Buddy was created by a young USPSA shooter just starting out in the sport. This free tool is designed to help sport shooters improve their dry fire practice.</p>
        <p>Whether you're new to USPSA or an experienced competitor, Dry Fire Buddy offers a range of timers and simulators to enhance your training. Use it to refine your draw, practice transitions, or work on your reload speed  all without the cost of ammunition.</p>
        <p>Remember, consistent dry fire practice is key to improving your skills. Train smart, train often, and stay safe!</p></p>
    `
};

function loadPage(page) {
    content.classList.remove('fade-in');
    setTimeout(() => {
        content.innerHTML = pages[page];
        content.classList.add('fade-in');
        if (page === 'par') {
            initParTimer();
        } else if (page === 'uspsasim') {
            initUSPSASimulator();
        } else if (page === 'timer') {
            initSimpleTimer();
        }
    }, 300);
}

function handleNavigation() {
    const hash = window.location.hash.slice(1) || 'home';
    loadPage(hash);
}

window.addEventListener('hashchange', handleNavigation);
window.addEventListener('load', handleNavigation);

document.querySelector('nav').addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.preventDefault();
        window.location.hash = e.target.getAttribute('href').slice(1);
    }
});

function initParTimer() {
    let timer;
    let startTime;
    let isRunning = false;
    let currentRep = 0;
    let delayTimer;

    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const parTimeInput = document.getElementById('parTime');
    const delayTimeInput = document.getElementById('delayTime');
    const repsInput = document.getElementById('reps');

    // Create audio elements
    const startBeep = new Audio('startbeep.wav');
    const nextSetBeep = new Audio('nextset.mp3');
    const setEndBeep = new Audio('setend.mp3');

    function beep(sound) {
        sound.currentTime = 0; // Reset audio to start
        sound.play().catch(error => console.error('Error playing sound:', error));
    }

    function setTimerColor(color) {
        timerDisplay.style.backgroundColor = color;
    }

    function startTimer() {
        if (!isRunning && (!isListening || startBtn.disabled === false)) {
            isRunning = true;
            currentRep = 0;
            startNextRep();
            startBtn.disabled = true;
            stopBtn.disabled = false;
            resetBtn.disabled = true;
        }
    }

    function startNextRep() {
        currentRep++;
        if (currentRep <= parseInt(repsInput.value)) {
            timerDisplay.textContent = `Rep ${currentRep} - Delay`;
            setTimerColor('#5AC8FA'); // Blue color when waiting for beep
            delayTimer = setTimeout(() => {
                beep(startBeep);
                startTime = Date.now();
                timer = setInterval(updateTimer, 10);
                setTimerColor('#34C759'); // Green color when timer starts
            }, parseFloat(delayTimeInput.value) * 1000);
        } else {
            stopTimer();
            beep(setEndBeep);
        }
    }

    function stopTimer() {
        if (isRunning && (!isListening || stopBtn.disabled === false)) {
            isRunning = false;
            clearInterval(timer);
            clearTimeout(delayTimer);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = false;
            setTimerColor('#FF3B30'); // Red color when stopped
        }
    }

    function resetTimer() {
        if (!isListening || resetBtn.disabled === false) {
            stopTimer();
            currentRep = 0;
            timerDisplay.textContent = '0.00';
            setTimerColor(''); // Reset color
            resetBtn.disabled = true;
        }
    }

    function updateTimer() {
        const elapsedTime = (Date.now() - startTime) / 1000;
        timerDisplay.textContent = elapsedTime.toFixed(2);
        if (elapsedTime >= parseFloat(parTimeInput.value)) {
            beep(nextSetBeep);
            clearInterval(timer);
            delayTimer = setTimeout(startNextRep, 1000);
        }
    }

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Add input validation
    [parTimeInput, delayTimeInput, repsInput].forEach(input => {
        input.addEventListener('change', function() {
            let value = parseFloat(this.value);
            let min = parseFloat(this.min);
            let max = parseFloat(this.max);
            let step = parseFloat(this.step);

            if (isNaN(value) || value < min) {
                this.value = min;
            } else if (value > max) {
                this.value = max;
            } else {
                this.value = Math.round(value / step) * step;
            }
        });
    });

    // Voice recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;
    const voiceCommandBtn = document.createElement('button');
    voiceCommandBtn.id = 'voiceCommandBtn';
    voiceCommandBtn.className = 'btn btn-secondary';
    voiceCommandBtn.textContent = 'Enable Voice Commands';
    document.querySelector('.buttons').appendChild(voiceCommandBtn);

    function toggleVoiceCommands() {
        if (isListening) {
            recognition.stop();
            voiceCommandBtn.textContent = 'Enable Voice Commands';
            isListening = false;
        } else {
            recognition.start();
            voiceCommandBtn.textContent = 'Disable Voice Commands';
            isListening = true;
        }
    }

    recognition.onresult = function(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();

        console.log('Voice command recognized:', command);

        if (command.includes('start')) {
            startTimer();
        } else if (command.includes('stop')) {
            stopTimer();
        } else if (command.includes('reset')) {
            resetTimer();
        }
    };

    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
    };

    voiceCommandBtn.addEventListener('click', toggleVoiceCommands);

    // Initialize timer display
    resetTimer();
}

function initUSPSASimulator() {
    let startTime;
    let timer;
    let isWaiting = false;

    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');

    const areYouReadySound = new Audio('areuready.mp3');
    const startBeep = new Audio('startbeep.wav');
    const setEndBeep = new Audio('setend.mp3');

    function playSound(sound) {
        return new Promise((resolve) => {
            sound.currentTime = 0;
            sound.play().catch(error => console.error('Error playing sound:', error));
            sound.onended = resolve;
        });
    }

    function setTimerColor(color) {
        timerDisplay.style.backgroundColor = color;
    }

    async function startTimer() {
        if (!isWaiting && (!isListening || startBtn.disabled === false)) {
            isWaiting = true;
            timerDisplay.textContent = 'Get ready...';
            setTimerColor(''); // Reset color when start is clicked
            startBtn.disabled = true;
            stopBtn.disabled = true;
            resetBtn.disabled = true;

            await playSound(areYouReadySound);

            timerDisplay.textContent = 'Wait for beep...';
            setTimerColor('#5AC8FA'); // Blue color when waiting for beep

            const randomDelay = Math.random() * 2000 + 2000; // Random delay between 2 and 4 seconds
            setTimeout(() => {
                playSound(startBeep);
                startTime = Date.now();
                timer = setInterval(updateTimer, 10);
                stopBtn.disabled = false;
                setTimerColor('#34C759'); // Green color when timer starts
            }, randomDelay);
        }
    }

    function stopTimer() {
        if (timer && (!isListening || stopBtn.disabled === false)) {
            clearInterval(timer);
            isWaiting = false;
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = false;
            setTimerColor('#FF3B30'); // Red color when stopped
            playSound(setEndBeep);
        }
    }

    function resetTimer() {
        if (!isListening || resetBtn.disabled === false) {
            clearInterval(timer);
            timerDisplay.textContent = '0.00';
            setTimerColor('');
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = true;
        }
    }

    function updateTimer() {
        const elapsedTime = (Date.now() - startTime) / 1000;
        timerDisplay.textContent = elapsedTime.toFixed(2);
    }

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Voice recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;
    const voiceCommandBtn = document.createElement('button');
    voiceCommandBtn.id = 'voiceCommandBtn';
    voiceCommandBtn.className = 'btn btn-secondary';
    voiceCommandBtn.textContent = 'Enable Voice Commands';
    document.querySelector('.buttons').appendChild(voiceCommandBtn);

    function toggleVoiceCommands() {
        if (isListening) {
            recognition.stop();
            voiceCommandBtn.textContent = 'Enable Voice Commands';
            isListening = false;
        } else {
            recognition.start();
            voiceCommandBtn.textContent = 'Disable Voice Commands';
            isListening = true;
        }
    }

    recognition.onresult = function(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();

        console.log('Voice command recognized:', command);

        if (command.includes('start')) {
            startTimer();
        } else if (command.includes('stop')) {
            stopTimer();
        } else if (command.includes('reset')) {
            resetTimer();
        }
    };

    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
    };

    voiceCommandBtn.addEventListener('click', toggleVoiceCommands);

    // Initialize timer display
    resetTimer();
}

function initSimpleTimer() {
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');

    let startTime;
    let timer;
    let isRunning = false;

    const startBeep = new Audio('startbeep.wav');
    const setEndBeep = new Audio('setend.mp3');

    function playSound(sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error('Error playing sound:', error));
    }

    function setTimerColor(color) {
        timerDisplay.style.backgroundColor = color;
    }

    function startTimer() {
        if (!isRunning && (!isListening || startBtn.disabled === false)) {
            isRunning = true;
            playSound(startBeep);
            startTime = Date.now() - (startTime ? startTime : 0);
            timer = setInterval(updateTimer, 10);
            startBtn.disabled = true;
            stopBtn.disabled = false;
            resetBtn.disabled = true;
            setTimerColor('#34C759'); // Green when running
        }
    }

    function stopTimer() {
        if (isRunning && (!isListening || stopBtn.disabled === false)) {
            isRunning = false;
            clearInterval(timer);
            playSound(setEndBeep);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = false;
            setTimerColor('#FF3B30'); // Red when stopped
        }
    }

    function resetTimer() {
        if (!isListening || resetBtn.disabled === false) {
            clearInterval(timer);
            isRunning = false;
            timerDisplay.textContent = '00:00.00';
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = true;
            setTimerColor(''); // Reset color
            startTime = 0;
        }
    }

    function updateTimer() {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    }

    startBtn.addEventListener('click', startTimer);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Voice recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let isListening = false;
    const voiceCommandBtn = document.createElement('button');
    voiceCommandBtn.id = 'voiceCommandBtn';
    voiceCommandBtn.className = 'btn btn-secondary';
    voiceCommandBtn.textContent = 'Enable Voice Commands';
    document.querySelector('.buttons').appendChild(voiceCommandBtn);

    function toggleVoiceCommands() {
        if (isListening) {
            recognition.stop();
            voiceCommandBtn.textContent = 'Enable Voice Commands';
            isListening = false;
        } else {
            recognition.start();
            voiceCommandBtn.textContent = 'Disable Voice Commands';
            isListening = true;
        }
    }

    recognition.onresult = function(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.toLowerCase().trim();

        console.log('Voice command recognized:', command);

        if (command.includes('start')) {
            startTimer();
        } else if (command.includes('stop')) {
            stopTimer();
        } else if (command.includes('reset')) {
            resetTimer();
        }
    };

    recognition.onerror = function(event) {
        console.error('Voice recognition error:', event.error);
    };

    voiceCommandBtn.addEventListener('click', toggleVoiceCommands);

    // Initialize timer display
    resetTimer();
}
