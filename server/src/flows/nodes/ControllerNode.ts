import { NodeBuilder } from "@baklavajs/core";
import { IController } from "../../interfaces/IController";
import { IEnum } from "../../interfaces/IEnum";

export const getControllerNodeType = (name: string) => {
  return `$${name}`;
};

export const ControllerNodeFactory = (
  controller: IController,
  allEnums: IEnum[]
) => {
  if (controller.controlMode === "SIMPLE") {
    return null;
  }
  const nodeName = controller.name;
  const typeName = getControllerNodeType(nodeName);
  const ControllerNode = new NodeBuilder(typeName);
  ControllerNode.setName(nodeName);
  console.log("ControllerNodeFactory", controller);
  const addedFields = new Set<string>();
  controller.advancedFields.forEach((field) => {
    console.log(field);
    if (!field.name) {
      console.log("Returned because field.name was not found");
      return;
    }
    if (field.type === "ENUM") {
      const enumm = allEnums.find((v) => v.id === field.value);
      if (!enumm) {
        console.log("Returned because enumm was not found");
        return;
      }
      ControllerNode.addOption(field.name, "SelectOption", 0, undefined, {
        items: enumm.values.map((v, i) => ({ text: v, value: i })),
      });
    } else {
      ControllerNode.addOption(field.name, "NumberOption");
    }
    addedFields.add(field.name);
    ControllerNode.addOutputInterface(field.name);
  });
  ControllerNode.onCalculate((n) => {
    controller.advancedFields.forEach((field) => {
      if (!addedFields.has(field.name)) {
        return;
      }
      n.getInterface(field.name).value = n.getOptionValue(field.name);
    });
  });

  return { name: typeName, node: ControllerNode.build() };
};
