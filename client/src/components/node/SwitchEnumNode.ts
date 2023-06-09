import { IEnum } from "@/interfaces/IEnum";
import { NodeBuilder } from "@baklavajs/core";

export const SwitchEnumNodeFactory = (enumm: IEnum) => {
  const name = `Switch ${enumm.name} Value`;
  const builder = new NodeBuilder(name)
    .addInputInterface("Value", "SelectOption", 0, {
      items: enumm.values.map((v, i) => ({ text: v, value: i })),
    })
    .addOutputInterface("Output");

  enumm.values.forEach((v) => {
    builder.addInputInterface(v, "InputOption");
  });
  builder.onCalculate((n) => {
    const selectedOption = n.getInterface("Value").value;
    n.getInterface("Output").value = n.getInterface(
      enumm.values[selectedOption]
    ).value;
  });

  return { name, node: builder.build() };
};
