import { Node } from "@baklavajs/core";

export class ClampNode extends Node {
  type = "ClampNode";
  name = "Clamp";

  constructor() {
    super();
    this.addInputInterface("Value", "NumberOption", 1);
    this.addInputInterface("Min", "NumberOption", 0);
    this.addInputInterface("Max", "NumberOption", 1);
    // this.addOption("Operation", "SelectOption", "Add", undefined, {
    //   items: ["Add", "Subtract", "Multiply", "Divide"],
    // });
    this.addOutputInterface("Result");
  }

  calculate() {
    const value = this.getInterface("Value").value;
    const min = this.getInterface("Min").value;
    const max = this.getInterface("Max").value;
    const result = Math.min(Math.max(min, value), max);

    this.getInterface("Result").value = result;
  }
}
