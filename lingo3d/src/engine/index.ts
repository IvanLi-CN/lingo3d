import boxHelper from "./boxHelper"
import skeletonHelper from "./skeletonHelper"
import mainOrbitControls from "./mainOrbitCamera"
import transformControls from "./transformControls"
import gridHelper from "./gridHelper"
import referencePlane from "./referencePlane"
import skyShader from "./skyShader"
import render from "./renderLoop"
import background from "./background"
import defaultLight from "./defaultLight"
import defaultFog from "./defaultFog"
import { preventTreeShake } from "@lincode/utils"
import { setDebug } from "../states/useDebug"

preventTreeShake([
    render,
    skyShader,
    referencePlane,
    gridHelper,
    transformControls,
    mainOrbitControls,
    boxHelper,
    skeletonHelper,
    background,
    defaultLight,
    defaultFog
])

export default {}

const w = window as any
"__THREE__" in w && (w.__THREE__ += " - Lingo3D Beta")
w.setDebug = setDebug