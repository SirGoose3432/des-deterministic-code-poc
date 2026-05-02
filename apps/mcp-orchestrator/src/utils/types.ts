export interface PropSchema {
  type: string;
  rawType?: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

export interface ComponentSchema {
  component: string;
  displayName: string;
  description: string;
  filePath: string;
  props: Record<string, PropSchema>;
  requiredProps: string[];
  optionalProps: string[];
}