import { ICustomField } from "../interfaces/IController";

export function reconcileFieldChanges(
  oldFields: ICustomField[],
  newFields: ICustomField[]
) {
  const oldFieldNames = new Set(oldFields.map((f) => f.name));
  const newFieldNames = new Set(newFields.map((f) => f.name));

  const removedFields = oldFields.filter((f) => !newFieldNames.has(f.name));
  const addedFields = newFields.filter((f) => !oldFieldNames.has(f.name));

  const commonFields = oldFields.filter((f) => newFieldNames.has(f.name));

  const changedFields = commonFields.filter((f) => {
    const newField = newFields.find((nf) => nf.name === f.name);
    if (!newField) return false;
    return newField.value !== f.value;
  });

  return {
    removedFields,
    addedFields,
    changedFields,
  };
}
