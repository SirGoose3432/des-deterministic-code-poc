import * as docgen from 'react-docgen-typescript';
import { resolveComponent, DESIGN_SYSTEM_TSCONFIG } from '../utils/component-resolver';
import { PropSchema, ComponentSchema } from '../utils/types';

const parser = docgen.withCustomConfig(DESIGN_SYSTEM_TSCONFIG, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) =>
    prop.parent == null || !prop.parent.fileName.includes('node_modules'),
});

export function getComponentSchema(componentName: string): ComponentSchema {
  const { componentPath } = resolveComponent(componentName);

  const docs = parser.parse(componentPath);
  if (!docs.length) {
    throw new Error(`react-docgen-typescript found no exported component in: ${componentPath}`);
  }

  const doc = docs[0];
  const props: Record<string, PropSchema> = {};

  for (const [name, prop] of Object.entries(doc.props ?? {})) {
    // prop.type.name can be an array for enums with shouldExtractLiteralValuesFromEnum.
    const typeName = Array.isArray(prop.type.name)
      ? (prop.type.name as Array<{ value: unknown }>).map((v) => v.value ?? v).join(' | ')
      : String(prop.type.name ?? 'unknown');

    props[name] = {
      type: typeName,
      rawType: prop.type.raw && prop.type.raw !== typeName ? prop.type.raw : undefined,
      required: prop.required,
      defaultValue: prop.defaultValue?.value ?? null,
      description: prop.description,
    };
  }

  const propNames = Object.keys(props);

  return {
    component: componentName,
    displayName: doc.displayName,
    description: doc.description,
    filePath: componentPath,
    props,
    requiredProps: propNames.filter((k) => props[k].required),
    optionalProps: propNames.filter((k) => !props[k].required),
  };
}
