//Timer Controller
const STARTBUTTON = document.getElementById("startButton");
const PAUSEBUTTON = document.getElementById("pauseButton");
const STOPBUTTON = document.getElementById("stopButton");

const SERIESNUMBERINPUT = document.getElementById("seriesNumber");
const REPSNUMBERINPUT = document.getElementById("repsNumber");

// Time inputs
const FIRSTRESTINPUT = document.getElementById("firstRest");
const SECONDRESTINPUT = document.getElementById("secondRest");
const TIMEDOWNINPUT = document.getElementById("timeDown");
const TIMEUPINPUT = document.getElementById("timeUp");

//Countdown of each state
const FIRSTRESTCOUNTER = document.getElementById("first-rest-Counter");
const DOWNCOUNTER = document.getElementById("down-Counter");
const SECONDRESTCOUNTER = document.getElementById("second-rest-Counter");
const UPCOUNTER = document.getElementById("up-Counter");

//A countdown element. Count the time of rest beetween series.
const respRest = document.getElementById("respRest");

//Title of each state
const downTitle = document.getElementById("downTitle");
const upTitle = document.getElementById("upTitle");
const firstrestTitle = document.getElementById("first-restTitle");
const secondrestTitle = document.getElementById("second-restTitle");

//Element that show the total of repetition and series
const SERCOUNTER = document.getElementById("seriesCounter");
const REPSCOUNTER = document.getElementById("reps-Counter");


const SERIEREPSCOUNTER = document.getElementById("seriesRestNumber");


const PRESETONEBUTTON = document.getElementById("presetOne");
const PRESETTWOBUTTON = document.getElementById("presetTwo");
const PRESETTHREEBUTTON = document.getElementById("presetThree");

//Show a error message if the number of inputs are wrong
const error = document.getElementById("error");

//Audio is play on the beggining each state
const audio = new Audio("./Sounds/click.mp3");

let time = 0;
let intervalId = null;
let startTimeoutId = null; // <-- nueva variable para la espera inicial
let isPaused = false;      // <-- indica si está en pausa
let phase = "firstRest"; // Puede ser "down", "rest", "up"
let reps = 0;
let series = 0;

let max_reps = 15;
let max_series = 1;

//Default value of times values
let firstRestTime;
let downTime;
let secondRestTime;
let upTime;

let serieRest;



PRESETONEBUTTON.addEventListener("click", () => selectValues(1));
PRESETTWOBUTTON.addEventListener("click", () => selectValues(2));
PRESETTHREEBUTTON.addEventListener("click", () => selectValues(3));


function selectValues(type) {
    if (type === 1) {
        console.log("Lento");
        firstRestTime = 3;
        downTime = 7;
        secondRestTime = 3;
        upTime = 7;

        FIRSTRESTINPUT.value = 3;
        TIMEDOWNINPUT.value = 7;
        SECONDRESTINPUT.value = 3;
        TIMEUPINPUT.value = 7;

    }
    else if (type === 2) {
        console.log("Normal");
        firstRestTime = 2;
        downTime = 3;
        secondRestTime = 2;
        upTime = 3;
        FIRSTRESTINPUT.value = 2;
        TIMEDOWNINPUT.value = 3;
        SECONDRESTINPUT.value = 2;
        TIMEUPINPUT.value = 3;
    }
    else if (type === 3) {
        console.log("Rapido");
        firstRestTime = 1;
        downTime = 1;
        secondRestTime = 1;
        upTime = 1;

        FIRSTRESTINPUT.value = 0;
        TIMEDOWNINPUT.value = 1;
        SECONDRESTINPUT.value = 0;
        TIMEUPINPUT.value = 1;
    }
}



//If the startButton was press, play and audio, start the functions "setTime()" and "contar()""
STARTBUTTON.addEventListener("click", () => {
    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
    });
    setTime();
    setSeriesandReps();
    contar();
});

PAUSEBUTTON.addEventListener("click", () => {
    // Si estamos en la espera inicial de 3s, cancela y marca como pausado
    if (startTimeoutId) {
        clearTimeout(startTimeoutId);
        startTimeoutId = null;
        isPaused = true;
        PAUSEBUTTON.textContent = "Reanudar";
        return;
    }

    // Si el intervalo está corriendo --> pausar
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        isPaused = true;
        PAUSEBUTTON.textContent = "Reanudar";
    } else {
        // si está pausado --> reanudar inmediatamente
        intervalId = setInterval(ejecutarFase, 1000);
        isPaused = false;
        PAUSEBUTTON.textContent = "Pausar";
    }
});

STOPBUTTON.addEventListener("click", stopTimer);

function stopTimer() {
    // Cancela cualquier timeout/interval en curso
    if (startTimeoutId) {
        clearTimeout(startTimeoutId);
        startTimeoutId = null;
    }
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // Resetea estado y UI
    isPaused = false;
    phase = "firstRest";
    time = 0;
    reps = 0;
    REPSCOUNTER.textContent = `${reps}`;
    FIRSTRESTCOUNTER.textContent = `0 s`;
    DOWNCOUNTER.textContent = `0 s`;
    SECONDRESTCOUNTER.textContent = `0 s`;
    UPCOUNTER.textContent = `0 s`;
    respRest.textContent = `0 s`;

    // Quitar clases visuales de fases
    downTitle.classList.remove("this");
    upTitle.classList.remove("this");
    firstrestTitle.classList.remove("this");
    secondrestTitle.classList.remove("this");

    PAUSEBUTTON.textContent = "Pausar";
}


//----------------------------------------------------------------------------------------

const setTime = () => {
    if (isNaN(FIRSTRESTINPUT.value) || isNaN(TIMEDOWNINPUT.value) || isNaN(SECONDRESTINPUT.value) || isNaN(TIMEUPINPUT.value)) {
        error.textContent = "Coloque un numero.";
        return;
    }
    if (TIMEDOWNINPUT.value < 0 || FIRSTRESTINPUT.value < 0 || TIMEUPINPUT.value < 0 || SECONDRESTINPUT.value < 0) {
        error.textContent = "El número debe ser mayor que cero.";
        return;
    }

    error.textContent = ""; // Limpia errores

    firstRestTime = Number(FIRSTRESTINPUT.value);
    downTime = Number(TIMEDOWNINPUT.value);
    secondRestTime = Number(SECONDRESTINPUT.value);
    upTime = Number(TIMEUPINPUT.value);
}

const setSeriesandReps = () => {

    if (isNaN(REPSNUMBERINPUT.value) || isNaN(SERIESNUMBERINPUT.value) || isNaN(SERIEREPSCOUNTER.value)) {
        error.textContent = "Coloque un numero.";
        return;
    }
    if (REPSNUMBERINPUT.value <= 0 || SERIESNUMBERINPUT.value <= 0 || SERIEREPSCOUNTER.value <= 0) {
        error.textContent = "El número debe ser mayor que cero.";
        return;
    }

    max_reps = Number(REPSNUMBERINPUT.value);
    max_series = Number(SERIESNUMBERINPUT.value);
    series = max_series;
    SERCOUNTER.textContent = series;

    serieRest = Number(SERIEREPSCOUNTER.value);
}

//----------------------------------------------------------------------------------------


function contar() {
    // Evita múltiples inicios si ya hay un intervalo o ya está en la espera inicial
    if (intervalId !== null || startTimeoutId !== null) return;

    startTimeoutId = setTimeout(() => {
        intervalId = setInterval(ejecutarFase, 1000);
        startTimeoutId = null;
    }, 3000); // Espera 3 segundos antes de empezar
}

function ejecutarFase() {
    if (phase === "firstRest") {
        firstRestExercise();
    } else if (phase === "down") {
        doDownExercise();
    }
    else if (phase === "secondRest") {
        secondRestExercise();
    }
    else if (phase === "up") {
        doUpExercise();
    }
    else if (phase === "repsRest") {
        repsRest();
    }
}

function firstRestExercise() {
    FIRSTRESTCOUNTER.textContent = `${time} s`;
    firstrestTitle.classList.add("this")
    upTitle.classList.remove("this")
    if (time >= firstRestTime) {
        playSound();
        clearInterval(intervalId);
        phase = "down";
        time = 0;
        intervalId = setInterval(ejecutarFase, 1000);
    }
    else {
        time += 1;
    }
}

function doDownExercise() {
    DOWNCOUNTER.textContent = `${time} s`;
    downTitle.classList.add("this")
    firstrestTitle.classList.remove("this")
    if (time >= downTime) {
        playSound();
        clearInterval(intervalId);
        phase = "secondRest";
        time = 0;
        intervalId = setInterval(ejecutarFase, 1000);
    }
    else {
        time += 1;
    }
}

function secondRestExercise() {
    SECONDRESTCOUNTER.textContent = `${time} s`;
    secondrestTitle.classList.add("this")
    downTitle.classList.remove("this")
    if (time >= secondRestTime) {
        playSound();
        clearInterval(intervalId);
        phase = "up";
        time = 0;
        intervalId = setInterval(ejecutarFase, 1000);
    }
    else {
        time += 1;
    }
}


function doUpExercise() {
    UPCOUNTER.textContent = `${time} s`;
    upTitle.classList.add("this")
    secondrestTitle.classList.remove("this")
    if (time >= upTime) {
        playSound();
        reps += 1;
        REPSCOUNTER.textContent = `${reps}`;
        if (reps >= max_reps) {
            clearInterval(intervalId);
            phase = "repsRest";
            series -= 1;
            SERCOUNTER.textContent = series;
            reps = 0;
            REPSCOUNTER.textContent = `${reps}`;
            time = 0;
            intervalId = setInterval(ejecutarFase, 1000);
            if (series <= 0) {
                stopTimer();
            }
        } else {
            time = 0;
            clearInterval(intervalId);
            phase = "firstRest";
            time = 0;
            intervalId = setInterval(ejecutarFase, 1000);
        }

    }
    else {
        time += 1;
    }
}
function repsRest() {
    respRest.textContent = `${time} s`;
    if (time >= serieRest) {
        clearInterval(intervalId);
        phase = "firstRest";
        time = 0;
        intervalId = setInterval(ejecutarFase, 1000);
    }
    else {
        time += 1;
    }
}

function playSound() {
    audio.currentTime = 0;
    audio.play();
}

