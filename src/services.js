import { interval } from "rxjs"
import { map } from "rxjs/operators"

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

const getPosition = () => {
    let position
    try {
        position = video.currentTime
        return ({
            type: "update_position",
            position
        })
    } catch (error) {
        return ({
            type: "error",
            message: error.message
        })
    }
}

export const getCurrentPlayerTime = interval(100)
    .pipe(
        map(getPosition),
        // tap(console.log)
    )

export const getDuration = () => new Promise((resolve, reject) => {
    let duration
    try {
        duration = video.duration
        resolve({
            type: "update_duration",
            duration
        })
    } catch (error) {
        reject({
            type: "error",
            message: error.message
        })
    }
})

export const getReadyState = () => new Promise((resolve, reject) => {
    // Ugh, don't like this, but it "works"
    setTimeout(() => {
        if (video.readyState >= 2) {
            resolve("player_ready")
            return 
        } 
        reject("player_not_ready")
    }, 100)
})
