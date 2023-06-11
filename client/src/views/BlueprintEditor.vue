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
  ALL_CONTROLLERS,
  ALL_ENUMS,
  CONTROLLER_ADDED,
  CONTROLLER_REMOVED,
  CONTROLLER_UPDATED,
  ENUM_ADDED,
  ENUM_REMOVED,
  ENUM_UPDATED,
} from "@/api/queries";
import { IEnum } from "@/interfaces/IEnum";
import { SwitchEnumNodeFactory } from "@/components/node/SwitchEnumNode";
import { ControllerNodeFactory } from "@/components/node/ControllerNode";
import { ColorNode } from "@/components/node/ColorNode";
import { SelectEnumNodeFactory } from "@/components/node/SelectEnumNode";
import { addEnumNodes } from "@/components/node/utils/addEnumNodes";
import { IController } from "@/interfaces/IController";
import { addControllerNodes } from "@/components/node/utils/addControllerNodes";
import { ColorConversionNode } from "@/components/node/ColorConversionNode";
export default defineComponent({
  data: () => ({
    loadingEnums: false,
    allEnums: [] as IEnum[],
    editor: new Editor(),
    viewPlugin: new ViewPlugin(),
    engine: new Engine(true),
    intfTypePlugin: new InterfaceTypePlugin(),
    loadingControllers: false,
    allControllers: [] as IController[],
  }),
  async created() {
    subscribeData({ query: CONTROLLER_ADDED }, ({ controllerAdded }) => {
      console.log("added");
      if (controllerAdded) {
        this.allControllers.push(controllerAdded);
      }
    });

    subscribeData({ query: CONTROLLER_UPDATED }, ({ controllerUpdated }) => {
      if (controllerUpdated) {
        this.allControllers = this.allControllers.map((controller) =>
          controllerUpdated.id === controller.id
            ? controllerUpdated
            : controller
        );
      }
    });

    subscribeData({ query: CONTROLLER_REMOVED }, ({ controllerRemoved }) => {
      if (controllerRemoved) {
        this.allControllers = this.allControllers.filter(
          (controller) => controllerRemoved !== controller.id
        );
      }
    });

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
    await this.getAllControllers();
    // create new node
    // add node to editor
    this.editor.registerNodeType("Clamp", ClampNode);
    addControllerNodes(
      ControllerNodeFactory,
      this.allControllers,
      this.allEnums,
      this.editor as Editor
    );
    this.editor.registerNodeType("Color", ColorNode);
    this.editor.registerNodeType("Color Conversion", ColorConversionNode);
    this.editor.registerNodeType("Math", MathNode);
    this.editor.registerNodeType("Output", OutputNode);
    addEnumNodes(SelectEnumNodeFactory, this.allEnums, this.editor as Editor);
    addEnumNodes(SwitchEnumNodeFactory, this.allEnums, this.editor as Editor);

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
    async getAllControllers() {
      this.loadingControllers = true;
      const { allControllers } = await getData({
        query: ALL_CONTROLLERS,
      });
      this.allControllers = allControllers;
      this.loadingControllers = false;
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
