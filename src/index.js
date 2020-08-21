import { fromEvent } from "rxjs";
import { Machine, interpret } from "xstate";
import "./styles.css";

import { from } from "rxjs";

const machine = Machine({
  initial: "red",
  states: {
    green: { TOGGLE: "red" },
    red: { TOGGLE: "green" }
  }
});
const service = interpret(machine).start();

// const state$ = from(service);

// state$.subscribe((state) => {
//   console.log(state.value);
// });

// document.getElementById("app").innerHTML = `
// hi
// `;
console.log(service.state.value);
service.send("TOGGLE");
console.log(service.state.value);

fromEvent(document, "click").subscribe(() => {
  service.send("TOGGLE");
});
