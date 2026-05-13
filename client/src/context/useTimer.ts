import { useContext } from "react"
import { TimerContext } from "./timer-context"

export const useTimer = () => useContext(TimerContext)
