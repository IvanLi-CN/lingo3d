import store, { createEffect } from "@lincode/reactivity"
import { WebGLRenderTarget } from "three"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"
import { WIDTH, HEIGHT } from "../globals"
import { getPixelRatio } from "./usePixelRatio"
import { getRenderer } from "./useRenderer"
import { getResolution } from "./useResolution"
import { getSMAA } from "./useSMAA"

const [setEffectComposer, getEffectComposer] = store<EffectComposer | undefined>(undefined)
export { getEffectComposer }

createEffect(() => {
    const renderer = getRenderer()
    if (!renderer) return

    if (getSMAA()) {
        setEffectComposer(new EffectComposer(renderer))
        return
    }
    
    //@ts-ignore
    const msaaRenderTarget = new WebGLRenderTarget(WIDTH, HEIGHT, { samples: 4 })
    const handle = getResolution(([w, h]) => msaaRenderTarget.setSize(w, h))
    setEffectComposer(new EffectComposer(renderer, msaaRenderTarget))

    return () => {
        msaaRenderTarget.dispose()
        handle.cancel()
    }
}, [getRenderer, getSMAA])


createEffect(() => {
    const effectComposer = getEffectComposer()
    if (!effectComposer) return

    const [w, h] = getResolution()
    effectComposer.setSize(w, h)
    effectComposer.setPixelRatio(getPixelRatio())

}, [getEffectComposer, getResolution, getPixelRatio])