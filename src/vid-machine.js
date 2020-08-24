import { Machine, interpret, assign } from "xstate";

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
        id: 'incInterval',
        src: "getCurrentPlayerTime"
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
        services: {
            getCurrentPlayerTime: () => (callback, onReceive) => {
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
        },
        guards: {
            isSpacebar: (ctx, event) => event.code === "Space"
        }
    })

