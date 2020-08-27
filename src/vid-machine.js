import { Machine, assign } from "xstate";
import { pauseMediaPlayer, startMediaPlayer, getCurrentPlayerTime } from "./services"

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
            on: {
                press_play: {
                    target: 'startMediaPlayer',
                },
                keydown: {
                    target: 'startMediaPlayer',
                    cond: 'isSpacebar'
                }
            }
        },
        pauseMediaPlayer: {
            invoke: {
                id: "pauseMediaPlayer",
                src: "pauseMediaPlayer",
                onDone: {
                    target: "paused",
                    actions: () => { console.log("pausing!");}
                },
                onError: {
                    target: "paused",
                    actions: console.error
                }
            },
        },
        startMediaPlayer: {
            invoke: {
                id: "startMediaPlayer",
                src: "startMediaPlayer",
                onDone: {
                    target: "playing",
                    actions: () => { console.log("starting!");}
                },
                onError: {
                    target: "paused",
                    actions: console.error
                }
            },
        },
        playing: {
            on: {
                press_pause: 'pauseMediaPlayer',
                keydown: {
                    target: 'pauseMediaPlayer',
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

export const videoMachine = Machine({
    id: "video",
    type: "parallel",
    context: {
        position: 0
    },
    states: {
        controlsVisibility: controlsVisibilityStates,
        controls: controlsStates
    },
    invoke: {
        id: "playerTime",
        src: "getCurrentPlayerTime"
    }
},
    {
        services: {
            pauseMediaPlayer,
            startMediaPlayer,
            getCurrentPlayerTime,
        },
        guards: {
            isSpacebar: (ctx, event) => event.code === "Space"
        }
    })
