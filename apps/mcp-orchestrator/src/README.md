# Example inputs

## Button Component


Button
```json
{
  "component": "Button",
  "props": {
    "label": "Save changes",
    "variant": "primary",
    "size": "md",
    "loading": false,
    "onClick": "handleSave"
  }
}
```

Output
```string
<Button
  label="Save changes"****
  variant="primary"
  size="md"
  loading={false}
  onClick={handleSave}
/>
```

ComponentMode Output
```string
import { Button } from 'ui-design-system';

export default function MyButtonComponent(): JSX.Element {
  return (
    <Button
      label="Save changes"
      variant="primary"
      size="md"
      loading={false}
      onClick={handleSave}
    />
  );
}
```

Minimal Example
```json
{
  "component": "Button",
  "props": {
    "label": "Submit"
  }
}
```

Component Mode
```json
{
  "component": "Button",
  "props": {
    "label": "Delete account",
    "variant": "danger",
    "onClick": "handleDelete"
  },
  "mode": "component",
  "componentName": "DeleteAccountButton"
}
```

## Modal

Modal
```json
{
  "component": "Modal",
  "props": {
    "isOpen": "isOpen",
    "onClose": "handleClose",
    "title": "Confirm delete",
    "size": "sm",
    "closeOnBackdropClick": false
  },
  "children": "This action cannot be undone.",
  "mode": "component",
  "componentName": "ConfirmDeleteModal"
}
```