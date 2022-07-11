import { h } from "preact"
import { preventTreeShake } from "@lincode/utils"
import { useEffect, useRef, useState } from "preact/hooks"
import { Pane } from "tweakpane"
import { Cancellable } from "@lincode/promiselikes"
import addObjectInputs from "../Editor/addObjectInputs"
import Cube from "../../display/primitives/Cube"
import ContextMenu from "../ContextMenu"
import MenuItem from "../ContextMenu/MenuItem"

preventTreeShake(h)

type NodeProps = {
    x?: number
    y?: number
    onClick: () => void
}
type Data = {
    x: number
    y: number
    menuItems: Array<{ text: string; onClick?: () => void }>
}

const Node = ({ x = 0, y = 0, onClick }: NodeProps) => {
    const [pointerDown, setPointerDown] = useState(false)
    const [left, setLeft] = useState(x)
    const [top, setTop] = useState(y)
    const tweakpaneDivRef = useRef<HTMLDivElement>(null)
    const movableEl = useRef<HTMLDivElement>(null)
    const [data, setData] = useState<Data | undefined>()

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
            onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setData({
                    x: e.offsetX,
                    y: e.offsetY,
                    menuItems: [
                        {
                            text: "Remove node",
                            onClick: () => onClick()
                        }
                    ]
                })
            }}
            style={{
                overflow: "hidden",
                width: 240,
                height: 300,
                background: "rgba(0, 0, 0, 0.5)",
                position: "absolute",
                left: left,
                top: top,
                zIndex: 999
            }}
        >
            <div
                style={{
                    display: "flex",
                    background: "rgba(255, 255, 255, 0.5)",
                    height: "25px",
                    cursor: "pointer",
                    zIndex: 999
                }}
            >
                <div
                    ref={movableEl}
                    style={{ height: "100%", width: "100%", background: "yellow" }}
                    onPointerDown={(e) => {
                        e.stopPropagation()
                        setPointerDown(true)
                    }}
                    onPointerUp={() => setPointerDown(false)}
                    onPointerMove={(e) => {
                        if (!pointerDown) return
                        setLeft(left + e.movementX)
                        setTop(top + e.movementY)
                    }}
                >
                    drag me!
                </div>
            </div>
            <div
                ref={tweakpaneDivRef}
                style={{ height: "285px", overflowY: "scroll" }}
            />
            <ContextMenu data={data} setData={setData}>
                {data?.menuItems.map((item) => (
                    <MenuItem
                        setData={setData}
                        onClick={() => item.onClick?.()}
                    >
                        {item.text}
                    </MenuItem>
                ))}
            </ContextMenu>
        </div>
    )
}
export default Node
