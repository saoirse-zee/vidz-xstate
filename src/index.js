import { interpret } from "xstate";
import { from, fromEvent } from 'rxjs';
import { videoMachine } from "./vid-machine"
import "./styles.css";

const service = interpret(videoMachine)
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

