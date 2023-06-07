<template>
  <div class="blueprint-editor">
    <baklava-editor :plugin="viewPlugin"></baklava-editor>
  </div>
</template>

<script>
import { Editor, NodeBuilder } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { Engine } from "@baklavajs/plugin-engine";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
import { OutputNode } from "@/components/node/OutputNode.ts";
import { MathNode } from "@/components/node/MathNode.ts";
import { ClampNode } from "@/components/node/ClampNode.ts";
export default {
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
      .addOutputInterface("Simple")
      .addOutputInterface("Advanced")
      .onCalculate((n) => {
        n.getInterface("Simple").value = n.getOptionValue("Simple");
        n.getInterface("Advanced").value = n.getOptionValue("Advanced");
      })
      .build();
    // add node to editor
    this.editor.registerNodeType("SelectTestNode", SelectTestNode);
    this.editor.registerNodeType("OutputNode", OutputNode);
    this.editor.registerNodeType("MathNode", MathNode);
    this.editor.registerNodeType("ClampNode", ClampNode);
  },
  methods: {},
};
</script>
<style>
.blueprint-editor {
  width: 90vw;
  height: 90vh;
  margin: 0px auto;
}
</style>
