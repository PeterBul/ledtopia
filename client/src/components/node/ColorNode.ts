import { Node } from "@baklavajs/core";

export class ColorNode extends Node {
  type = "ColorNode";
  name = "Color";

  constructor() {
    super();
    this.addOption("Color", "ColorOption", "#00ff00");
    this.addOutputInterface("Color");
  }

  calculate() {
    const colorValue = this.getOptionValue("Color");
    this.getInterface("Color").value = colorValue;
  }
}
