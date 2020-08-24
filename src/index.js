import { Machine, interpret, assign } from "xstate";
import { from, fromEvent } from 'rxjs';
import "./styles.css";

const video = document.querySelector("video")

const controlsVisibilityStates = {
  id: "controlsVisibility",
  initial: "hidden",
  states: {
    visible: {
      after: {
        3000: "hidden"
      }
    },
    hidden: {
      on: {
        mousemove: "visible"
      }
    }
  }
}

const controlsStates = {
  id: 'controlsStates',
  initial: 'paused',
  states: {
    paused: {
      entry: ['pauseMediaPlayer'],
      on: {
        press_play: {
          target: 'playing',
        },
        keydown: {
          target: 'playing',
          cond: 'isSpacebar'
        }
      }
    },
    playing: {
      entry: ['startMediaPlayer'],
      on: {
        press_pause: 'paused',
        keydown: {
          target: 'paused',
          cond: 'isSpacebar'
        },
        update_position: {
          target: "playing",
          actions: assign((context, event) => ({
            ...context,
            position: event.position
          }))
        }
      }
    }
  },
}


const uiMachine = Machine({
  id: "ui",
  type: "parallel",
  context: {
    position: 0
  },
  states: {
    controlsVisibility: controlsVisibilityStates,
    controls: controlsStates
  },
  invoke: {
    id: 'incInterval',
    src: () => (callback, onReceive) => {
      // Query the player for the current position every 100ms
      const id = setInterval(() => {
        const position = video.currentTime
        // Update the machine's context with the new position
        callback({
          type: "update_position",
          position
        })
      }, 100);

      // Perform cleanup
      return () => clearInterval(id);
    }
  }
},
  {
    actions: {
      startMediaPlayer: () => {
        video.play()
      },
      pauseMediaPlayer: () => {
        video.pause()
      },
    },
    guards: {
      isSpacebar: (ctx, event) => event.code === "Space"
    }
  })

const service = interpret(uiMachine)
const state$ = from(service);
service
  .onTransition((state, event) => {
    // console.log(state.context);
    // console.log(event);
  })
  .start();

fromEvent(document.getElementById("play"), 'click').subscribe(() => {
  service.send("press_play")
});
fromEvent(document.getElementById("pause"), 'click').subscribe(() => {
  service.send("press_pause")
});

fromEvent(document, "keydown")
  .subscribe((e) => {
    service.send(e)
  })
fromEvent(document, "mousemove")
  .subscribe((e) => {
    service.send(e)
  })

state$.subscribe(state => {
  // document.getElementById("state").innerHTML = JSON.stringify(state.context)
  const formattedTime = Math.floor(state.context.position)
  document.getElementById("playhead-position").innerHTML = JSON.stringify(formattedTime)
  if (state.matches("controlsVisibility.hidden")) {
    document.querySelector(".controls").classList.add("hidden")
  } else {
    document.querySelector(".controls").classList.remove("hidden")
  }
  if (state.matches("controls.playing")) {
    document.querySelector("#play").setAttribute("disabled", true)
    document.querySelector("#pause").removeAttribute("disabled")
  } else {
    document.querySelector("#pause").setAttribute("disabled", true)
    document.querySelector("#play").removeAttribute("disabled")
  }
});

