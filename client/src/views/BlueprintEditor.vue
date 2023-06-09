<template>
  <div class="blueprint-editor">
    <baklava-editor :plugin="viewPlugin"></baklava-editor>
  </div>
</template>

<script lang="ts">
import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { Engine } from "@baklavajs/plugin-engine";
import { InterfaceTypePlugin } from "@baklavajs/plugin-interface-types";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
import { OutputNode } from "@/components/node/OutputNode";
import { MathNode } from "@/components/node/MathNode";
import { ClampNode } from "@/components/node/ClampNode";
import { defineComponent } from "vue";
import ColorOption from "@/components/baklavaOptions/ColorOption.vue";
import { getData, subscribeData } from "@/api/getData";
import {
  ALL_ENUMS,
  ENUM_ADDED,
  ENUM_REMOVED,
  ENUM_UPDATED,
} from "@/api/queries";
import { IEnum } from "@/interfaces/IEnum";
import { SwitchEnumNodeFactory } from "@/components/node/SwitchEnumNode";
import { ColorNode } from "@/components/node/ColorNode";
import { SelectEnumNodeFactory } from "@/components/node/SelectEnumNode";
import { addEnumNode } from "@/components/node/utils/addEnumNode";
export default defineComponent({
  data: () => ({
    loadingEnums: false,
    allEnums: [] as IEnum[],
    editor: new Editor(),
    viewPlugin: new ViewPlugin(),
    engine: new Engine(true),
    intfTypePlugin: new InterfaceTypePlugin(),
  }),
  async created() {
    subscribeData({ query: ENUM_ADDED }, ({ enumAdded }) => {
      console.log("enum added");
      if (enumAdded) {
        this.allEnums.push(enumAdded);
      }
    });

    subscribeData({ query: ENUM_UPDATED }, ({ enumUpdated }) => {
      console.log("enum updated");
      if (enumUpdated) {
        this.allEnums = this.allEnums.map((enumm) =>
          enumUpdated.id === enumm.id ? enumUpdated : enumm
        );
      }
    });

    subscribeData({ query: ENUM_REMOVED }, ({ enumRemoved }) => {
      console.log("enum removed");
      if (enumRemoved) {
        this.allEnums = this.allEnums.filter(
          (enumm) => enumRemoved !== enumm.id
        );
      }
    });

    console.log("Getting devices");
    this.editor.use(this.viewPlugin);
    this.editor.use(new OptionPlugin());
    this.editor.use(this.engine);
    this.editor.use(this.intfTypePlugin);
    this.intfTypePlugin.addType("number", "#FF0000");
    this.viewPlugin.registerOption("ColorOption", ColorOption);
    await this.getAllEnums();
    // create new node
    // add node to editor
    this.editor.registerNodeType("ClampNode", ClampNode);
    this.editor.registerNodeType("ColorNode", ColorNode);
    this.editor.registerNodeType("MathNode", MathNode);
    this.editor.registerNodeType("OutputNode", OutputNode);
    addEnumNode(SelectEnumNodeFactory, this.allEnums, this.editor as Editor);
    addEnumNode(SwitchEnumNodeFactory, this.allEnums, this.editor as Editor);

    const node1 = this.addNodeWithCoordinates(ColorNode, 100, 140);
  },
  methods: {
    addNodeWithCoordinates(nodeType: any, x: number, y: number) {
      const n = new nodeType();
      this.editor.addNode(n);
      n.position.x = x;
      n.position.y = y;
      return n;
    },
    async getAllEnums() {
      const { allEnums } = await getData({
        query: ALL_ENUMS,
      });
      this.allEnums = allEnums;
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
