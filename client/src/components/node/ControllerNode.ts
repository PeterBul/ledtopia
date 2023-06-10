import { IController } from "@/interfaces/IController";
import { IEnum } from "@/interfaces/IEnum";
import { NodeBuilder } from "@baklavajs/core";

export const ControllerNodeFactory = (
  controller: IController,
  allEnums: IEnum[]
) => {
  if (controller.controlMode === "SIMPLE") {
    return null;
  }
  const nodeName = controller.name;
  const ControllerNode = new NodeBuilder(nodeName);
  controller.advancedFields.forEach((field) => {
    if (!field.name) {
      return;
    }
    if (field.type === "ENUM") {
      const enumm = allEnums.find((v) => v.id === field.value);
      if (!enumm) {
        return;
      }
      ControllerNode.addOption(field.name, "SelectOption", 0, undefined, {
        items: enumm.values.map((v, i) => ({ text: v, value: i })),
      });
    } else {
      ControllerNode.addOption(field.name, "NumberOption");
    }
    ControllerNode.addOutputInterface(field.name);
  });
  ControllerNode.onCalculate((n) => {
    controller.advancedFields.forEach((field) => {
      n.getInterface(field.name).value = n.getOptionValue(field.name);
    });
  });

  return { name: nodeName, node: ControllerNode.build() };
};
