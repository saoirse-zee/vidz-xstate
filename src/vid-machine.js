import { Machine, assign, send } from "xstate";
import { pauseMediaPlayer, startMediaPlayer, getCurrentPlayerTime, getDuration, getReadyState } from "./services"

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

const playerStates = {
    id: 'playerStates',
    initial: 'idle',
    states: {
        idle: {
            invoke: [
                {
                    id: "ready",
                    src: "getReadyState",
                    onDone: "gettingMetaData"
                    // TODO: Handle onError: player_not_ready
                },
            ],
        },
        gettingMetaData: {
            invoke: [
                {
                    id: "duration",
                    src: "getDuration",
                    onDone: {
                        target: "paused", // Stay in "idle"
                        actions: assign((context, event) => {
                            return ({
                                ...context,
                                duration: event.data.duration
                            })
                        })
                    }
                },
            ]
        },
        paused: {
            on: {
                press_play: {
                    target: 'starting',
                },
                keydown: {
                    target: 'starting',
                    cond: 'isSpacebar'
                },
            }
        },
        starting: {
            invoke: {
                id: "startMediaPlayer",
                src: "startMediaPlayer",
                onDone: {
                    target: "playing",
                    actions: () => { console.log("starting!"); }
                },
                onError: {
                    target: "paused",
                    actions: console.error
                }
            },
        },
        pausing: {
            invoke: {
                id: "pauseMediaPlayer",
                src: "pauseMediaPlayer",
                onDone: {
                    target: "paused",
                    actions: () => { console.log("pausing!"); }
                },
                onError: {
                    target: "paused",
                    actions: console.error
                }
            },
        },
        playing: {
            invoke: { id: "playerTime", src: "getCurrentPlayerTime" },
            on: {
                press_pause: 'pausing',
                keydown: {
                    target: 'pausing',
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
        duration: null,
        readyState: null,
        position: 0
    },
    states: {
        controlsVisibility: controlsVisibilityStates,
        player: playerStates
    },
},
    {
        services: {
            pauseMediaPlayer,
            startMediaPlayer,
            getCurrentPlayerTime,
            getDuration,
            getReadyState
        },
        guards: {
            isSpacebar: (ctx, event) => event.code === "Space"
        }
    }
)