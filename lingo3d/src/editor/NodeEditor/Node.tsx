import { h } from "preact"
import { preventTreeShake } from "@lincode/utils"
import { useEffect, useRef } from "preact/hooks"
import { Pane } from "tweakpane"
import { Cancellable } from "@lincode/promiselikes"
import addObjectInputs from "../Editor/addObjectInputs"
import Cube from "../../display/primitives/Cube"

preventTreeShake(h)

type NodeProps = {
    x?: number
    y?: number
}

const Node = ({ x = 0, y = 0 }: NodeProps) => {
    const tweakpaneDivRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = tweakpaneDivRef.current
        if (!el) return

        const pane = new Pane({ container: el })
        const handle = new Cancellable()

        const cube = new Cube()
        addObjectInputs(cube, pane, handle)

        return () => {
            pane.dispose()
            handle.cancel()
        }
    }, [])

    return (
        <div
            style={{
                overflow: "hidden",
                width: 300,
                height: 300,
                background: "rgba(0, 0, 0, 0.5)",
                position: "absolute",
                left: x,
                top: y,
                overflowY: "scroll"
            }}
        >
            <div
             style={{ background: "rgba(255, 255, 255, 0.5)" }}
             onPointerDown={e => {
                e.stopPropagation()
             }}
            >
                drag me!
            </div>
            <div ref={tweakpaneDivRef} />
        </div>
    )
}
export default Node
