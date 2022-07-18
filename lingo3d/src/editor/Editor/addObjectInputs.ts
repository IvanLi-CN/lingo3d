import { Cancellable } from "@lincode/promiselikes"
import { omit } from "@lincode/utils"
import { emitSceneGraphNameChange } from "../../events/onSceneGraphNameChange"
import { onTransformControls } from "../../events/onTransformControls"
import assignIn from "./assignIn"
import getParams from "./getParams"
import splitObject from "./splitObject"

import { debounce } from "@lincode/utils"
import { Pane } from "tweakpane"
import Defaults from "../../interface/utils/Defaults"
import createElement from "../../utils/createElement"

let programmatic = false

let leading = true
export const setProgrammatic = debounce(
    () => {
        programmatic = leading
        leading = !leading
    },
    100,
    "both"
)

const toFixed = (v: any) => (typeof v === "number" ? Number(v.toFixed(2)) : v)

const isPoint = (v: any): v is { x: number; y: number; z?: number } =>
    v && typeof v === "object" && "x" in v && "y" in v

const isTrue = (v: any) => v === true || v === "true"
const isFalse = (v: any) => v === false || v === "false"

const isEqual = (a: any, b: any) => {
    if (isPoint(a) && isPoint(b))
        return a.x === b.x && a.y === b.y && a.z === b.z

    if (isTrue(a) && isTrue(b)) return true
    if (isFalse(a) && isFalse(b)) return true

    return a === b
}

const addInputs = (
    pane: Pane,
    title: string,
    target: Record<string, any>,
    defaults: Defaults<any>,
    params = { ...target },
    onDragStart?: (
        start: { clientX: number; clientY: number },
        current: { clientX: number; clientY: number }
    ) => void,
    onDragMove?: (
        start: { clientX: number; clientY: number },
        current: { clientX: number; clientY: number }
    ) => void
) => {
    const folder = pane.addFolder({ title })

    for (const [key, value] of Object.entries(params))
        switch (typeof value) {
            case "undefined":
                params[key] = ""
                break

            case "number":
                params[key] = toFixed(value)
                break

            case "object":
                if (Array.isArray(value)) {
                    params[key] = JSON.stringify(value)
                    break
                }
                typeof value?.x === "number" && (value.x = toFixed(value.x))
                typeof value?.y === "number" && (value.y = toFixed(value.y))
                typeof value?.z === "number" && (value.z = toFixed(value.z))
                break
        }

    return Object.fromEntries(
        Object.keys(params).map((key) => {
            const input = folder.addInput(params, key)

            const resetButton = createElement(`
                <div style="width: 10px; height: 10px; background: white;"></div>
            `)
            input.element.prepend(resetButton)

            let startPoint = { clientX: 0, clientY: 0 }
            let currentPoint = { clientX: 0, clientY: 0 }
            let started = false

            //@ts-ignore
            resetButton.addEventListener("pointerdown", (e: PointerEvent) => {
                e.stopPropagation()
                e.preventDefault()
                resetButton.setPointerCapture(e.pointerId)
                startPoint.clientX = e.clientX
                startPoint.clientY = e.clientY
                onDragStart?.(startPoint, startPoint)
                started = true
            })
            //@ts-ignore
            resetButton.addEventListener("pointermove", (e: PointerEvent) => {
                currentPoint.clientX = e.clientX
                currentPoint.clientY = e.clientY
                started && onDragMove?.(startPoint, currentPoint)
            })
            //@ts-ignore
            resetButton.addEventListener("pointerup", (e: PointerEvent) => {
                resetButton.releasePointerCapture(e.pointerId)
                started = false
            })

            input.on("change", ({ value }) => {
                if (programmatic) return

                if (typeof value === "string") {
                    if (value === "true" || value === "false") {
                        target[key] = value === "true" ? true : false
                        return
                    }
                    const num = parseFloat(value)
                    if (!Number.isNaN(num)) {
                        target[key] = num
                        return
                    }
                }
                target[key] = toFixed(value)
            })
            return [key, input] as const
        })
    )
}

export default (
    target: any,
    pane: Pane,
    handle: Cancellable,
    onDragStart?: (
        start: { clientX: number; clientY: number },
        current: { clientX: number; clientY: number }
    ) => void,
    onDragMove?: (
        start: { clientX: number; clientY: number },
        current: { clientX: number; clientY: number }
    ) => void
) => {
    const { schema, defaults, componentName } = target.constructor

    const [generalParams, generalRest] = splitObject(
        omit(getParams(schema, defaults, target), [
            "rotation",
            "innerRotation",
            "frustumCulled",
            "physics",
            "minAzimuthAngle",
            "maxAzimuthAngle"
        ]),
        ["name", "id"]
    )
    if (generalParams) {
        const { name: nameInput } = addInputs(
            pane,
            "general",
            target,
            defaults,
            generalParams,
            onDragStart,
            onDragMove
        )
        nameInput.on("change", () => emitSceneGraphNameChange())
    }

    const [transformParams0, transformRest] = splitObject(generalRest, [
        "x",
        "y",
        "z",
        "rotationX",
        "rotationY",
        "rotationZ",
        "scale",
        "scaleX",
        "scaleY",
        "scaleZ",
        "innerX",
        "innerY",
        "innerZ",
        "innerRotationX",
        "innerRotationY",
        "innerRotationZ",
        "width",
        "height",
        "depth"
    ])
    if (transformParams0) {
        const [innerTransformParams, transformParams] = splitObject(
            transformParams0,
            [
                "innerX",
                "innerY",
                "innerZ",
                "innerRotationX",
                "innerRotationY",
                "innerRotationZ",
                "width",
                "height",
                "depth"
            ]
        )
        addInputs(
            pane,
            "transform",
            target,
            defaults,
            transformParams,
            onDragStart,
            onDragMove
        )
        innerTransformParams &&
            addInputs(
                pane,
                "inner transform",
                target,
                defaults,
                innerTransformParams,
                onDragStart,
                onDragMove
            )

        handle.watch(
            onTransformControls(() => {
                setProgrammatic()
                assignIn(transformParams, target, [
                    "x",
                    "y",
                    "z",
                    "rotationX",
                    "rotationY",
                    "rotationZ",
                    "scaleX",
                    "scaleY",
                    "scaleZ"
                ])
                pane.refresh()
            })
        )
    }

    const [displayParams, displayRest] = splitObject(transformRest, [
        "visible",
        "innerVisible"
    ])
    displayParams &&
        addInputs(
            pane,
            "display",
            target,
            defaults,
            displayParams,
            onDragStart,
            onDragMove
        )

    const [effectsParams, effectsRest] = splitObject(displayRest, [
        "bloom",
        "outline"
    ])
    effectsParams &&
        addInputs(
            pane,
            "effects",
            target,
            defaults,
            effectsParams,
            onDragStart,
            onDragMove
        )

    const [animationParams, animationRest] = splitObject(effectsRest, [
        "animation",
        "animationPaused",
        "animationRepeat"
    ])
    animationParams &&
        addInputs(
            pane,
            "animation",
            target,
            defaults,
            animationParams,
            onDragStart,
            onDragMove
        )

    const [adjustMaterialParams, adjustMaterialRest] = splitObject(
        animationRest,
        [
            "toon",
            "pbr",
            "metalnessFactor",
            "roughnessFactor",
            "opacityFactor",
            "emissiveIntensityFactor",
            "adjustEmissiveColor",
            "adjustColor"
        ]
    )
    adjustMaterialParams &&
        addInputs(
            pane,
            "adjust material",
            target,
            defaults,
            adjustMaterialParams,
            onDragStart,
            onDragMove
        )

    const [materialParams, materialRest] = splitObject(adjustMaterialRest, [
        "fog",
        "opacity",
        "color",
        "texture",
        "textureRepeat",
        "videoTexture",
        "wireframe"
    ])
    materialParams &&
        addInputs(
            pane,
            "material",
            target,
            defaults,
            materialParams,
            onDragStart,
            onDragMove
        )

    const [pbrMaterialParams, pbrMaterialRest] = splitObject(materialRest, [
        "metalnessMap",
        "metalness",
        "roughnessMap",
        "roughness",
        "normalMap",
        "normalScale",
        "normalMapType",
        "bumpMap",
        "bumpScale",
        "displacementMap",
        "displacementScale",
        "displacementBias",
        "aoMap",
        "aoMapIntensity",
        "lightMap",
        "lightMapIntensity",
        "emissiveMap",
        "emissiveIntensity",
        "emissiveColor",
        "envMap",
        "alphaMap"
    ])
    pbrMaterialParams &&
        addInputs(
            pane,
            "pbr material",
            target,
            defaults,
            pbrMaterialParams,
            onDragStart,
            onDragMove
        )

    if (componentName === "dummy") {
        pbrMaterialRest.stride = {
            x: target.strideRight,
            y: -target.strideForward
        }
        const { stride: strideInput } = addInputs(
            pane,
            componentName,
            target,
            defaults,
            pbrMaterialRest,
            onDragStart,
            onDragMove
        )
        strideInput.on("change", ({ value }) => {
            Object.assign(pbrMaterialRest, {
                strideForward: -value.y,
                strideRight: value.x
            })
            pane.refresh()
        })
    } else if (Object.keys(pbrMaterialRest).length)
        addInputs(
            pane,
            componentName,
            target,
            defaults,
            pbrMaterialRest,
            onDragStart,
            onDragMove
        )
}
