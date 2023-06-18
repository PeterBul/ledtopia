import { Node } from "@baklavajs/core";

export const e_ColorNodeOption = {
  Color: "Color",
} as const;

export const e_ColorNodeOutputInterface = {
  Color: "Color",
} as const;

export class ColorNode extends Node {
  type = "ColorNode";
  name = "Color";

  constructor() {
    super();
    this.addOption(e_ColorNodeOption.Color, "ColorOption", "#00ff00");
    this.addOutputInterface(e_ColorNodeOutputInterface.Color);
  }

  calculate() {
    const colorValue = this.getOptionValue(e_ColorNodeOption.Color);
    this.getInterface(e_ColorNodeOutputInterface.Color).value = colorValue;
  }
}
