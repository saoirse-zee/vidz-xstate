import { Machine, interpret } from "xstate";
import { from, fromEvent } from 'rxjs';
import "./styles.css";

const controlsStates = {
  id: 'controlsStates',
  initial: 'paused',
  states: {
    paused: {
      on: {
        press_play: 'playing',
        keydown: {
          target: 'playing',
          cond: 'isSpacebar'
        }
      }
    },
    playing: {
      on: {
        press_pause: 'paused',
        keydown: {
          target: 'paused',
          cond: 'isSpacebar'
        }
      }
    },
  }
}

const uiMachine = Machine({
  id: "ui",
  type: "parallel",
  states: {
    controlsVisibility: {
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
    },
    controls: controlsStates
  }
},
  {
    guards: {
      isSpacebar: (ctx, event) => event.code === "Space"
    }
  })

const service = interpret(uiMachine)
const state$ = from(service);
service.start();

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
  // document.getElementById("state").innerHTML = JSON.stringify(state.value)
  if (state.matches("controlsVisibility.hidden")) {
    document.querySelector(".controls").classList.add("hidden")
  } else {
    document.querySelector(".controls").classList.remove("hidden")
  }
  if (state.matches("controls.playing")) {
    document.querySelector(".movie").classList.add("play")
    document.querySelector("#play").setAttribute("disabled", true)
    document.querySelector("#pause").removeAttribute("disabled")
  } else {
    document.querySelector(".movie").classList.remove("play")
    document.querySelector("#pause").setAttribute("disabled", true)
    document.querySelector("#play").removeAttribute("disabled")
  }
});

