import { Cancellable } from "@lincode/promiselikes"
import { omit } from "@lincode/utils"
import { Pane } from "tweakpane"
import { emitSceneGraphNameChange } from "../../events/onSceneGraphNameChange"
import { onTransformControls } from "../../events/onTransformControls"
import addInputs, { setProgrammatic } from "./addInputs"
import assignIn from "./assignIn"
import getParams from "./getParams"
import splitObject from "./splitObject"

export default (target: any, pane: Pane, handle: Cancellable) => {
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
            generalParams
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
        addInputs(pane, "transform", target, defaults, transformParams)
        innerTransformParams &&
            addInputs(
                pane,
                "inner transform",
                target,
                defaults,
                innerTransformParams
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
    displayParams && addInputs(pane, "display", target, defaults, displayParams)

    const [effectsParams, effectsRest] = splitObject(displayRest, [
        "bloom",
        "outline"
    ])
    effectsParams && addInputs(pane, "effects", target, defaults, effectsParams)

    const [animationParams, animationRest] = splitObject(effectsRest, [
        "animation",
        "animationPaused",
        "animationRepeat"
    ])
    animationParams &&
        addInputs(pane, "animation", target, defaults, animationParams)

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
        addInputs(pane, "adjust material", target, defaults, adjustMaterialParams)

    const [materialParams, materialRest] = splitObject(
        adjustMaterialRest,
        [
            "fog",
            "opacity",
            "color",
            "texture",
            "textureRepeat",
            "videoTexture",
            "wireframe"
        ]
    )
    materialParams &&
        addInputs(pane, "material", target, defaults, materialParams)

    const [pbrMaterialParams, pbrMaterialRest] = splitObject(
        materialRest,
        [
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
        ]
    )
    pbrMaterialParams &&
        addInputs(pane, "pbr material", target, defaults, pbrMaterialParams)

    if (componentName === "dummy") {
        pbrMaterialRest.stride = { x: target.strideRight, y: -target.strideForward }
        const { stride: strideInput } = addInputs(
            pane,
            componentName,
            target,
            defaults,
            pbrMaterialRest
        )
        strideInput.on("change", ({ value }) => {
            Object.assign(pbrMaterialRest, {
                strideForward: -value.y,
                strideRight: value.x
            })
            pane.refresh()
        })
    } else if (Object.keys(pbrMaterialRest).length)
        addInputs(pane, componentName, target, defaults, pbrMaterialRest)
}