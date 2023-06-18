import { Editor } from "@baklavajs/core";
import { Engine } from "@baklavajs/plugin-engine";
import { IState } from "@baklavajs/core/dist/baklavajs-core/types/state";
import { addControllerNodes } from "./nodes/utils/addControllerNodes.js";
import {
  ControllerNodeFactory,
  getControllerNodeType,
} from "./nodes/ControllerNode.js";
import { ColorNode, e_ColorNodeOption } from "./nodes/ColorNode.js";
import { ColorConversionNode } from "./nodes/ColorConversionNode.js";
import { ILightNodeOutput, LightNode } from "./nodes/LightNode.js";
import { MathNode } from "./nodes/MathNode.js";
import { OutputNode } from "./nodes/OutputNode.js";
import { addEnumNodes } from "./nodes/utils/addEnumNodes.js";
import { SelectEnumNodeFactory } from "./nodes/SelectEnumNode.js";
import { SwitchEnumNodeFactory } from "./nodes/SwitchEnumNode.js";
import { database } from "../utils/db.js";
import { getAllControllers, getAllEnums } from "../utils/dbUtils.js";
import { ClampNode } from "./nodes/ClampNode.js";
import { TokenType } from "@baklavajs/core/dist/baklavajs-events/types/index.js";
import { IController } from "../interfaces/IController.js";

export class Flow {
  engine: Engine;
  editor: Editor;

  constructor(public name: string = "Unnamed", state: IState) {
    this.engine = new Engine(true);
    this.editor = new Editor();
    this.editor.use(this.engine);
    const allEnums = getAllEnums(database);
    const allControllers = getAllControllers(database);
    // create new node
    // add node to editor
    this.editor.registerNodeType("Clamp", ClampNode);
    addControllerNodes(
      ControllerNodeFactory,
      allControllers,
      allEnums,
      this.editor
    );
    this.editor.registerNodeType("ColorNode", ColorNode);
    this.editor.registerNodeType("ColorConversionNode", ColorConversionNode);
    this.editor.registerNodeType("LightNode", LightNode);
    this.editor.registerNodeType("MathNode", MathNode);
    this.editor.registerNodeType("OutputNode", OutputNode);
    addEnumNodes(SelectEnumNodeFactory, allEnums, this.editor);
    addEnumNodes(SwitchEnumNodeFactory, allEnums, this.editor);

    this.editor.load(state);
    console.log(`${this.name}: Root Nodes`, this.engine.rootNodes);
    this.engine.events.calculated.addListener(this, (result) => {
      // result is a Map<Node, any> with the key being a node instance and the value being what the node's calculate function returned
      for (const v of result.values()) {
        console.log("entry:", v);
      }
    });

    setTimeout(() => {
      this.editor.nodes
        .find((node) => node.type === "ColorNode")
        ?.setOptionValue(e_ColorNodeOption.Color, "#ff0000");
    }, 1000);
  }

  addNewControllerNode(controller: IController) {
    const allEnums = getAllEnums(database);
    const node = ControllerNodeFactory(controller, allEnums);
    if (node) {
      this.editor.registerNodeType(node.name, node.node);
    }
  }

  removeControllerNode(controller: IController) {
    const node = this.editor.nodes.find(
      (node) => node.type === getControllerNodeType(controller.name)
    );
    if (node) {
      this.editor.removeNode(node);
    }
  }

  tokens: Set<TokenType> = new Set();

  addListener(
    token: TokenType,
    callbackFn: (output: ILightNodeOutput) => void
  ) {
    this.tokens.add(token);
    this.engine.events.calculated.addListener(token, (result) => {
      for (const v of result.values()) {
        if (v === undefined) continue;
        if (v.type === "LightNode") {
          const output: ILightNodeOutput = v;
          callbackFn(output);
          break;
        }
      }
    });
  }

  update(state: IState) {
    // TODO: Test if loading a new state works
    // TODO: Test if listeners are still active after loading a new state
    console.log("Load new state: ", state);
    this.editor.load(state);
  }

  destroy() {
    this.tokens.forEach((token) => {
      this.engine.events.calculated.removeListener(token);
    });
    this.tokens = new Set();
  }

  removeListener(token: TokenType) {
    this.tokens.delete(token);
    this.engine.events.calculated.removeListener(token);
  }

  updateOptionValues(
    controllerName: string,
    optionValues: Record<string, number>
  ) {
    const node = this.editor.nodes.find(
      (node) => node.type === getControllerNodeType(controllerName)
    );
    if (node) {
      Object.entries(optionValues).forEach(([option, value]) => {
        try {
          node.setOptionValue(option, value);
        } catch (error) {
          console.error(error);
        }
      });
    }
  }
}
