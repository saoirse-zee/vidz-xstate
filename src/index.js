import { Machine, interpret } from "xstate";
import { from, fromEvent } from 'rxjs';
import "./styles.css";

const uiMachine = Machine({
  id: "ui",
  type: "parallel",
  states: {
    controlsVisible: {},
  }
})

const controlsMachine = Machine({
  id: 'controls',
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
}, 
{
  guards: {
    isSpacebar: (ctx, event) => event.code === "Space"
  }
});

const service = interpret(controlsMachine)
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

state$.subscribe(state => {
  document.getElementById("state").innerHTML = state.value
});

