import { e_BaseMode } from "@/interfaces/ILight";
import { capitalize } from "@/utils/capitalize";
import { Node } from "@baklavajs/core";

export class LightNode extends Node {
  type = "LightNode";
  name = "Light";

  constructor() {
    super();
    this.addInputInterface("mode", "SelectOption", "SIMPLE", {
      items: Object.values(e_BaseMode).map((v) => ({
        text: capitalize(v.toLowerCase()),
        value: v,
      })),
    });
    this.addInputInterface("hue", "NumberOption");
    this.addInputInterface("saturation", "NumberOption");
    this.addInputInterface("brightness", "NumberOption");
    this.addInputInterface("pulseSpeed", "NumberOption");
    this.addInputInterface("rainbowSpeed", "NumberOption");
  }
}
