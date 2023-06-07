<template>
  <div class="blueprint-editor">
    <baklava-editor :plugin="viewPlugin"></baklava-editor>
  </div>
</template>

<script lang="ts">
import { Editor, Node, NodeBuilder } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { Engine } from "@baklavajs/plugin-engine";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
import { OutputNode } from "@/components/node/OutputNode";
import { MathNode } from "@/components/node/MathNode";
import { ClampNode } from "@/components/node/ClampNode";
import { defineComponent } from "vue";
import ColorOption from "@/components/baklavaOptions/ColorOption.vue";
export default defineComponent({
  data: () => ({
    editor: new Editor(),
    viewPlugin: new ViewPlugin(),
    engine: new Engine(true),
    intfTypePlugin: new InterfaceTypePlugin(),
  }),
  created() {
    this.editor.use(this.viewPlugin);
    this.editor.use(this.engine);
    this.editor.use(new OptionPlugin());
    this.editor.use(this.intfTypePlugin);
    this.intfTypePlugin.addType("number", "#FF0000");
    this.viewPlugin.enableMinimap = true;
    this.viewPlugin.registerOption("ColorOption", ColorOption);
    // create new node
    const SelectTestNode = new NodeBuilder("SelectTestNode")
      .addOption("Simple", "SelectOption", "A", undefined, {
        items: ["A", "B", "C"],
      })
      .addOption("Advanced", "SelectOption", 3, undefined, {
        items: [
          { text: "X", value: 1 },
          { text: "Y", value: 2 },
          { text: "Z", value: 3 },
        ],
      })
      .addOption("Color", "ColorOption", "fsdg")
      .addOutputInterface("Simple")
      .addOutputInterface("Advanced")
      .addOutputInterface("Color")
      .onCalculate((n) => {
        n.getInterface("Simple").value = n.getOptionValue("Simple");
        n.getInterface("Advanced").value = n.getOptionValue("Advanced");
        n.getInterface("Color").value = n.getOptionValue("Color");
      })
      .build();
    // add node to editor
    this.editor.registerNodeType("SelectTestNode", SelectTestNode);
    this.editor.registerNodeType("OutputNode", OutputNode);
    this.editor.registerNodeType("MathNode", MathNode);
    this.editor.registerNodeType("ClampNode", ClampNode);

    const node1 = this.addNodeWithCoordinates(SelectTestNode, 100, 140);
  },
  methods: {
    addNodeWithCoordinates(nodeType: any, x: number, y: number) {
      const n = new nodeType();
      this.editor.addNode(n);
      n.position.x = x;
      n.position.y = y;
      return n;
    },
  },
});
</script>
<style>
.blueprint-editor {
  width: 90vw;
  height: 90vh;
  margin: 0px auto;
}
</style>
