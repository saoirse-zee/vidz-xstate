import { interval, Observable } from "rxjs"
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

const getNum = () => {
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

export const getCurrentPlayerTime = interval(500)
    .pipe(
        map(getNum),
        // tap(console.log)
    )
