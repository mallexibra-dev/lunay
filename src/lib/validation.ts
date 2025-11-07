import type { GenericSchema, GenericSchemaAsync, InferOutput } from 'valibot';
import { safeParseAsync } from 'valibot';

export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Validates data against a Valibot schema
 * @param data - The data to validate
 * @param schema - The Valibot schema to validate against
 * @returns Promise<ValidationResult<T>>
 */
export async function validateData<T extends GenericSchema | GenericSchemaAsync>(
  data: unknown,
  schema: T
): Promise<ValidationResult<InferOutput<T>>> {
  try {
    const result = await safeParseAsync(schema, data);

    if (result.success) {
      return {
        success: true,
        data: result.output,
      };
    }

    const errors: Record<string, string[]> = {};

    if (result.issues) {
      for (const issue of result.issues) {
        const path = issue.path?.length ? issue.path.join('.') : 'root';
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(issue.message);
      }
    }

    return {
      success: false,
      errors,
    };
  } catch {
    return {
      success: false,
      errors: {
        root: ['Validation failed due to an unexpected error'],
      },
    };
  }
}

/**
 * React Hook Form resolver for Valibot
 * @param schema - The Valibot schema
 * @param options - Additional resolver options
 * @returns React Hook Form resolver function
 */
export function valibotResolver<T extends GenericSchema | GenericSchemaAsync>(
  schema: T,
  _options?: {
    mode?: 'async' | 'sync';
    raw?: boolean;
  }
) {
  return async (values: unknown) => {
    const result = await validateData(values, schema);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors: Record<string, { type: string; message: string }> = {};

    if (result.errors) {
      for (const [field, messages] of Object.entries(result.errors)) {
        errors[field] = {
          type: 'validation',
          message: messages[0] || 'Invalid value',
        };
      }
    }

    return {
      values: {},
      errors,
    };
  };
}