const TALKING_THRESHOLD = 20;
const FLAPPINESS = 0.85;
const FILTER_FREQUENCY = 750;
const FILTER_STRENGTH = 0.3;

let getIsTalking;

(function audioInit() {
    const audioContext = new AudioContext();
    let talking = false;

    const analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    const filter = audioContext.createBiquadFilter();
    filter.Q.value = FILTER_STRENGTH;
    filter.frequency.value = FILTER_FREQUENCY;
    filter.type = "bandpass";

    const array = new Uint8Array(analyser.frequencyBinCount);
    getIsTalking = function getIsTalking() {
        analyser.getByteFrequencyData(array);

        let sum = 0;
        for (let i = 0; i < array.length; i++) {
            sum += array[i];
        }

        const average = sum / array.length;
        
        if(average > TALKING_THRESHOLD) {
            talking = true;
        } else if(talking && average > TALKING_THRESHOLD * FLAPPINESS) {
            talking = true;
        } else {
            talking = false;
        }

        return talking;
    };

    const userMediaPromise = navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
    }).then(stream => {
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(filter);
        filter.connect(analyser);
    }, (error) => {
        console.log("Error getting audio stream");
        console.error(error);
    });
})();