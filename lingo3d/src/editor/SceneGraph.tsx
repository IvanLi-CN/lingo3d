import { h } from "preact"
import { useEffect, useMemo, useState } from "preact/hooks"
import register from "preact-custom-element"
import { preventTreeShake } from "@lincode/utils"
import { onSceneChange } from "../events/onSceneChange"
import { appendableRoot } from "../api/core/Appendable"

preventTreeShake(h)

type TreeItemProps = {
    appendable: any
}

const TreeItem = ({ appendable }: TreeItemProps) => {
    const { componentName } = appendable.constructor

    return (
        <div style={{
            color: "white",
            fontFamily: "arial",
            fontSize: 12,
            opacity: 0.75
        }}>
            {componentName}
        </div>
    )
}

const SceneGraph = () => {
    const [r, render] = useState({})

    useEffect(() => {
        const handle = onSceneChange(() => render({}))
        return () => {
            handle.cancel()
        }
    }, [])

    const appendables = useMemo(() => [...appendableRoot], [r])

    return (
        <div style={{
             userSelect: "none",
             width: 250,
             height: "100%",
             overflowX: "hidden",
             overflowY: "scroll",
             float: "left",
             background: "rgb(40, 41, 46)"
        }}>
            {appendables.map(appendable => (
                <TreeItem appendable={appendable} key={appendable.uuid} />
            ))}
        </div>
    )
}

register(SceneGraph, "lingo3d-scenegraph")