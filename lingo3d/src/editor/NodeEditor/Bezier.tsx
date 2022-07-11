type BezierProps = {
    startPoint: [number, number]
    endPoint: [number, number]
}

const Bezier = ({ startPoint, endPoint }: BezierProps) => {
    const [x0, y0] = startPoint
    const [x1, y1] = endPoint

    const controlPoint0 = [x0 + (x1 - x0) * 0.5, y0]
    const controlPoint1 = [x0 + (x1 - x0) * 0.5, y1]

    const [width, height] = [x1 - x0, y1 - y0]

    return (
        <svg
            style={{ position: "absolute", left: x0, top: y0, width, height }}
            viewBox={`0 0 ${width} ${height}`}
            className="z-50 absfull pointer-events-none"
        >
            <path
                d={`M ${startPoint} C ${controlPoint0} ${controlPoint1} ${endPoint}`}
                // strokeDashoffset={p.offset}
                // strokeDasharray={offset}
                stroke="white"
                strokeWidth="2"
                fill="none"
            />
        </svg>
    )
}

export default Bezier
