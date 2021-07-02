const { EventEmitter } = require("events");
const { app } = require("electron");
const iohook = require("iohook");

const downkeys = new Set();
const emitter = module.exports = new EventEmitter();

iohook.on("mousemove", event => {
  emitter.emit("mouse", event.x, event.y);
});

for (const eventName of ["mousedown", "mouseup", "keydown", "keyup"]) {
    iohook.on(eventName, event => {
        if(eventName == "keydown") {
            if (downkeys.has(event.keycode)) {
                // Ignore key repeat
                return;
            }
            downkeys.add(event.keycode);
        }
        if(eventName == "keyup") {
            downkeys.delete(event.keycode);
        }

        emitter.emit(eventName);
    });
}

iohook.start();

app.on("quit", () => {
    console.log("Quitting");
    iohook.stop();
});
