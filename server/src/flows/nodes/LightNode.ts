import { Node } from "@baklavajs/core";
import { capitalize } from "./utils/capitalize.js";
import { e_BaseMode } from "../../interfaces/e_BaseMode.js";

export type ILightNodeOutput = ReturnType<LightNode["calculate"]>;

export class LightNode extends Node {
  type = "LightNode";
  name = "Light";

  constructor() {
    super();
    this.addInputInterface("on", "BooleanOption", true);
    this.addInputInterface("mode", "SelectOption", "SIMPLE", {
      items: Object.values(e_BaseMode).map((v) => ({
        text: capitalize(v.toLowerCase()),
        value: v,
      })),
    });
    this.addInputInterface("hue", "NumberOption");
    this.addInputInterface("saturation", "NumberOption", 255);
    this.addInputInterface("brightness", "NumberOption", 255);
    this.addInputInterface("pulseSpeed", "NumberOption", 100);
    this.addInputInterface("rainbowSpeed", "NumberOption", 100);
  }

  calculate() {
    return {
      type: "LightNode" as const,
      // TODO: Add on and mode to LightNode (both backend and frontend)
      on: this.getInterface("on").value as boolean | null,
      mode: this.getInterface("mode").value as e_BaseMode | null,
      hue: this.getInterface("hue").value as number | null,
      saturation: this.getInterface("saturation").value as number | null,
      brightness: this.getInterface("brightness").value as number | null,
      pulseSpeed: this.getInterface("pulseSpeed").value as number | null,
      rainbowSpeed: this.getInterface("rainbowSpeed").value as number | null,
    };
  }
}
