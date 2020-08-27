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

export const getCurrentPlayerTime = () => {
    return new Observable((subscriber) => {
        setInterval(() => {
            let position
            try {
                position = video.currentTime
                subscriber.next({
                    type: "update_position",
                    position
                })
            } catch (error) {
                subscriber.next({
                    type: "error",
                    message: error.message
                })
            }
        }, 100)
    })
}
