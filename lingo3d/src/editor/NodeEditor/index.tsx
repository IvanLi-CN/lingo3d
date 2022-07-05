import { h } from "preact"
import register from "preact-custom-element"
import { preventTreeShake } from "@lincode/utils"
import { useNodeEditor } from "../states"
import { useEffect } from "preact/hooks"

preventTreeShake(h)

const NodeEditor = () => {
    useEffect(() => {
        // Attach the BaklavaJS to the DOM node
        const editorDiv = document.getElementById("nodeEditor")
        const viewPlugin = BaklavaJS.createBaklava(editorDiv)
        const editor = viewPlugin.editor
        viewPlugin.enableMinimap = true
        viewPlugin.snappingProvider(30, 30)

        // Register the plugins into the editot
        editor.use(new BaklavaJS.PluginOptionsVue.OptionPlugin())
        editor.use(new BaklavaJS.PluginEngine.Engine(true))
        // editor.use(new BaklavaJS.PluginInterfaceTypes.InterfaceTypePlugin())

        // Create new nodes
        const node1 = new BaklavaJS.Core.NodeBuilder("My node")
            .setName("node1")
            .addInputInterface("Gligor")
            .addOutputInterface("output1")
            .addOutputInterface("output2")
            .addOutputInterface("output3")
            .addOption("Dropdown", "SelectOption", 3, undefined, {
                items: [
                    { text: "X", value: 1 },
                    { text: "Y", value: 2 },
                    { text: "Z", value: 3 }
                ]
            })
            .build()
        const node2 = new BaklavaJS.Core.NodeBuilder("My node")
            .setName("node2")
            .addOption("Simple Dropdown", "SelectOption", 3, undefined, {
                items: ["A", "B", "C"]
            })
            .addInputInterface("Lai1")
            .addInputInterface("Lai2")
            .addOutputInterface("Xue")
            .build()

        const node3 = new BaklavaJS.Core.NodeBuilder("My node")
            .setName("node3")
            .addInputInterface("Number 1", "NumberOption", 1)
            .addInputInterface("testInputInterface")
            .addOption("Operation", "SelectOption", "Add", undefined, {
                items: ["Add", "Subtract"]
            })
            .addOutputInterface("Output")
            .onCalculate((n) => {
                const n1 = n.getInterface("Number 1").value
                const n2 = n.getInterface("Number 2").value
                const operation = n.getOptionValue("Operation")
                let result
                if (operation === "Add") {
                    result = n1 + n2
                } else if (operation === "Subtract") {
                    result = n1 - n2
                }
                n.getInterface("Output").value = result
            })
            .build()

        // register new nodes
        editor.registerNodeType("node1", node1)
        editor.registerNodeType("node2", node2)
        editor.registerNodeType("node3", node3)

        // make node instances
        const nodeInstance1 = new node1()
        const nodeInstance2 = new node2()
        const nodeInstance3 = new node3()

        // add connections
        editor.addConnection(
            nodeInstance1.getInterface("output1"),
            nodeInstance2.getInterface("Lai1")
        )
        editor.addConnection(
            nodeInstance1.getInterface("output2"),
            nodeInstance3.getInterface("testInputInterface")
        )

        // add nodes to the editor
        editor.addNode(nodeInstance1)
        editor.addNode(nodeInstance2)
        editor.addNode(nodeInstance3)

        // set nodes starting position
        nodeInstance1.position.x = 50
        nodeInstance1.position.y = -650
        nodeInstance2.position.x = 100
        nodeInstance2.position.y = -650
        nodeInstance3.position.x = 200
        nodeInstance3.position.y = -650

        console.log(editor)
    })

    return (
        <div
            className="lingo3d-ui"
            style={{
                overflow: "hidden",
                width: 500,
                height: "100%",
                background: "rgb(40, 41, 46)"
            }}
        >
            <div id="nodeEditor"> </div>
        </div>
    )
}

const NodeEditorParent = () => {
    const [nodeEditor] = useNodeEditor()

    if (!nodeEditor) return null

    return <NodeEditor />
}

register(NodeEditorParent, "lingo3d-node-editor")
