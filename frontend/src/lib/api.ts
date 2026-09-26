export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeInput {
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
}

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiFailure {
  success: false;
  message: string;
  data: null;
  errors: { field: string; message: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const body = (await res.json()) as ApiSuccess<T> | ApiFailure;

  if (!res.ok || !body.success) {
    const failure = body as ApiFailure;
    const detail = failure.errors?.map((e) => e.message).join(", ");
    throw new Error(detail ? `${failure.message}: ${detail}` : failure.message);
  }

  return body.data;
}

export const getEmployees = () => request<Employee[]>("/empleados");

export const createEmployee = (data: EmployeeInput) =>
  request<Employee>("/empleados", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEmployee = (id: string, data: Partial<EmployeeInput>) =>
  request<Employee>(`/empleados/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteEmployee = (id: string) =>
  request<null>(`/empleados/${id}`, {
    method: "DELETE",
  });
