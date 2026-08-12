export function formatError(err: unknown): string {
  const errorObj = err as {
    response?: {
      data?: {
        error?: {
          body?: Record<string, { _errors?: string[] }>;
          query?: Record<string, { _errors?: string[] }>;
        };
        message?: string;
      };
    };
    message?: string;
  };

  const data = errorObj.response?.data;

  // Handle nested validation errors (Zod structure)
  if (data?.error?.body) {
    const bodyErrors = data.error.body;
    const messages: string[] = [];

    for (const field in bodyErrors) {
      if (field !== "_errors" && bodyErrors[field]?._errors?.length) {
        messages.push(`${field}: ${bodyErrors[field]._errors.join(", ")}`);
      }
    }

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  if (data?.error?.query) {
    const queryErrors = data.error.query;
    const messages: string[] = [];

    for (const field in queryErrors) {
      if (field !== "_errors" && queryErrors[field]?._errors?.length) {
        messages.push(`${field}: ${queryErrors[field]._errors.join(", ")}`);
      }
    }

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return data?.message || errorObj.message || "An unexpected error occurred";
}
