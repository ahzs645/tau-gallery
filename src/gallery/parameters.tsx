import type { JsonSchema } from '../tau/use-rendered-geometry.js';
import type { GalleryPreset } from './catalog.js';

type ParameterEditorProps = {
  readonly schema: JsonSchema | undefined;
  readonly values: Record<string, unknown>;
  readonly presets: readonly GalleryPreset[];
  readonly onChange: (values: Record<string, unknown>) => void;
};

export function ParameterEditor({ schema, values, presets, onChange }: ParameterEditorProps): React.JSX.Element {
  const resolvedSchema = schema ?? inferSchema(values);

  return (
    <div className="parameter-panel">
      {presets.length > 0 ? (
        <div className="preset-list" aria-label="Parameter presets">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                onChange(preset.parameters);
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      ) : null}

      {resolvedSchema?.properties ? (
        <div className="parameter-groups">
          {Object.entries(resolvedSchema.properties).map(([key, fieldSchema]) => (
            <ParameterField
              key={key}
              fieldKey={key}
              schema={fieldSchema}
              value={values[key]}
              path={[key]}
              onChange={(path, value) => {
                onChange(setValueAtPath(values, path, value));
              }}
            />
          ))}
        </div>
      ) : (
        <p className="inspector-note">Parameter schema is not available for this model.</p>
      )}
    </div>
  );
}

type ParameterFieldProps = {
  readonly fieldKey: string;
  readonly schema: JsonSchema;
  readonly value: unknown;
  readonly path: readonly string[];
  readonly onChange: (path: readonly string[], value: unknown) => void;
};

function ParameterField({ fieldKey, schema, value, path, onChange }: ParameterFieldProps): React.JSX.Element {
  const title = schema.title ?? formatLabel(fieldKey);

  if (schema.type === 'object' && schema.properties) {
    const objectValue = isRecord(value) ? value : {};

    return (
      <fieldset className="parameter-group">
        <legend>{title}</legend>
        {Object.entries(schema.properties).map(([childKey, childSchema]) => (
          <ParameterField
            key={childKey}
            fieldKey={childKey}
            schema={childSchema}
            value={objectValue[childKey]}
            path={[...path, childKey]}
            onChange={onChange}
          />
        ))}
      </fieldset>
    );
  }

  if (schema.enum) {
    return (
      <label className="parameter-field">
        <span>{title}</span>
        <select
          value={typeof value === 'string' ? value : String(schema.enum[0] ?? '')}
          onChange={(event) => {
            onChange(path, event.currentTarget.value);
          }}
        >
          {schema.enum.map((option) => (
            <option key={String(option)} value={String(option)}>
              {String(option)}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (schema.type === 'boolean') {
    return (
      <label className="parameter-field checkbox">
        <span>{title}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => {
            onChange(path, event.currentTarget.checked);
          }}
        />
      </label>
    );
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return (
      <label className="parameter-field">
        <span>{title}</span>
        <input
          type="number"
          value={typeof value === 'number' ? value : 0}
          min={schema.minimum}
          max={schema.maximum}
          step={schema.multipleOf ?? (schema.type === 'integer' ? 1 : 'any')}
          onChange={(event) => {
            onChange(path, event.currentTarget.valueAsNumber);
          }}
        />
      </label>
    );
  }

  return (
    <label className="parameter-field">
      <span>{title}</span>
      <input
        type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => {
          onChange(path, event.currentTarget.value);
        }}
      />
    </label>
  );
}

function setValueAtPath(
  values: Record<string, unknown>,
  path: readonly string[],
  value: unknown,
): Record<string, unknown> {
  const [first, ...rest] = path;
  if (!first) {
    return values;
  }

  if (rest.length === 0) {
    return { ...values, [first]: value };
  }

  const current = values[first];
  return {
    ...values,
    [first]: setValueAtPath(isRecord(current) ? current : {}, rest, value),
  };
}

export function mergeParameters(
  defaults: Record<string, unknown>,
  overrides: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...defaults };

  for (const [key, value] of Object.entries(overrides)) {
    const current = merged[key];
    merged[key] = isRecord(current) && isRecord(value) ? mergeParameters(current, value) : value;
  }

  return merged;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatLabel(key: string): string {
  return key
    .replaceAll('_', ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (first) => first.toUpperCase());
}

function inferSchema(values: Record<string, unknown>): JsonSchema | undefined {
  if (Object.keys(values).length === 0) {
    return undefined;
  }

  return {
    type: 'object',
    properties: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, inferFieldSchema(value)])),
  };
}

function inferFieldSchema(value: unknown): JsonSchema {
  if (isRecord(value)) {
    return {
      type: 'object',
      properties: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, inferFieldSchema(child)])),
    };
  }

  if (typeof value === 'number') {
    return { type: Number.isInteger(value) ? 'integer' : 'number' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  return { type: 'string' };
}
