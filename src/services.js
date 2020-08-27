const video = document.querySelector("video")

export const pauseMediaPlayer = () => {
    return new Promise((resolve, reject) => {
        try {
            video.pause()
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

export const startMediaPlayer = () => {
    return new Promise((resolve, reject) => {
        try {
            video.play()
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

export const getCurrentPlayerTime = () => (callback, onReceive) => {
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
