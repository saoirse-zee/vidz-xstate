import { interpret } from "xstate";
import { from, fromEvent } from 'rxjs';
import { videoMachine } from "./vid-machine"
import "./styles.css";

// Hook up the state machine
const service = interpret(videoMachine)
const state$ = from(service);
service
  .onTransition((state, event) => {
    // console.log(state.context);
    console.log(event);
    // console.log(state.value);
  })
  .start();


// Handle events
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
const playerBar = document.querySelector(".player-bar")
fromEvent(playerBar, "click").subscribe((e) => {
  const proportionClicked = e.offsetX / playerBar.getBoundingClientRect().width
  service.send({
    type: "playerbar_clicked",
    position: proportionClicked // 0..1
  })
})
fromEvent(document.getElementById("retry"), 'click').subscribe(() => {
  service.send("retry")
});




// Update the UI
state$.subscribe(state => {
  document.getElementById("error").style.display = "none"
  if (state.value.player === "error") {
    document.getElementById("error").style.display = "block"
  }
  document.getElementById("debug").innerText = state.toStrings().filter(s => s.includes("player.")).join("*")
  const formattedTime = JSON.stringify(Math.floor(state.context.position)) + "/" + state.context.duration
  document.getElementById("playhead-position").innerHTML = formattedTime 
  const playerPercentage = state.context.position / state.context.duration * 100
  document.querySelector(".progress").style.width = `${playerPercentage}%`

  if (state.matches("controlsVisibility.hidden")) {
    document.querySelector(".controls").classList.add("hidden")
  } else {
    document.querySelector(".controls").classList.remove("hidden")
  }

  if (state.matches("player.playing")) {
    document.querySelector("#play").setAttribute("disabled", true)
    document.querySelector("#pause").removeAttribute("disabled")
  } else {
    document.querySelector("#pause").setAttribute("disabled", true)
    document.querySelector("#play").removeAttribute("disabled")
  }
});

