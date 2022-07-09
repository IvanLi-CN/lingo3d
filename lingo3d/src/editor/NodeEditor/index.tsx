import { Fragment, h } from "preact"
import register from "preact-custom-element"
import { preventTreeShake } from "@lincode/utils"
import { useNodeEditor } from "../states"
import Node from "./Node"
import { useState } from "preact/hooks"
import ContextMenu from "../ContextMenu"
import MenuItem from "../ContextMenu/MenuItem"

preventTreeShake(h)

type Data = {
    x: number
    y: number
    menuItems: Array<{ text: string; onClick?: () => void }>
}

let disablePointerDown = false

const NodeEditor = () => {
    const [pointerDown, setPointerDown] = useState(false)
    const [left, setLeft] = useState(0)
    const [top, setTop] = useState(0)
    const [data, setData] = useState<Data | undefined>()

    return (
        <Fragment>
            <div
                className="lingo3d-ui"
                style={{
                    overflow: "hidden",
                    width: 500,
                    height: "100%",
                    background: "rgb(40, 41, 46)"
                }}
                onPointerDown={() =>
                    setTimeout(() => {
                        if (disablePointerDown) return
                        setPointerDown(true)
                    })
                }
                onPointerUp={() => setPointerDown(false)}
                onPointerMove={(e) => {
                    if (!pointerDown) return
                    setLeft(left + e.movementX)
                    setTop(top + e.movementY)
                }}
                onContextMenu={(e) => {
                    e.preventDefault()

                    disablePointerDown = true
                    setTimeout(() => (disablePointerDown = false))

                    setData({
                        x: e.clientX,
                        y: e.clientY,
                        menuItems: [
                            {
                                text: "Create Cube Node",
                                onClick: () => {
                                    console.log("first button clicked")
                                }
                            }
                        ]
                    })
                }}
            >
                <div style={{ left, top, position: "absolute" }}>
                    <Node x={0} y={0} />
                    <Node x={260} y={0} />
                </div>
            </div>
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
        </Fragment>
    )
}

const NodeEditorParent = () => {
    const [nodeEditor] = useNodeEditor()

    if (!nodeEditor) return null

    return <NodeEditor />
}
export default NodeEditorParent

register(NodeEditorParent, "lingo3d-node-editor")
