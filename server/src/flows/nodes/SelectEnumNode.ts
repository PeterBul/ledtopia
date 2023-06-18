import { NodeBuilder } from "@baklavajs/core";
import { IEnum } from "../../interfaces/IEnum.js";

export const SelectEnumNodeFactory = (enumm: IEnum) => {
  const nodeName = `Select ${enumm.name}`;
  const EnumNode = new NodeBuilder(nodeName)
    .addOption("Value", "SelectOption", 0, undefined, {
      items: enumm.values.map((v, i) => ({ text: v, value: i })),
    })
    .addOutputInterface("Value")
    .onCalculate((n) => {
      n.getInterface("Value").value = n.getOptionValue("Value");
    })
    .build();
  return { name: nodeName, node: EnumNode };
};
