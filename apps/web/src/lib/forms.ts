import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from './api';

export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
): void {
  // The API listed problems with specific fields: show each under its field
  if (error instanceof ApiError && error.fieldErrors.length > 0) {
    for (const fieldError of error.fieldErrors) {
      setError(fieldError.field as Path<T>, { message: fieldError.message });
    }
    return;
  }

  // Anything else: one message at the top of the form ("root")
  setError('root', {
    message: error instanceof ApiError ? error.message : 'Something went wrong. Please try again.',
  });
}