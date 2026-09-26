"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Employee,
  EmployeeInput,
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from "@/lib/api";

const emptyForm: EmployeeInput = {
  nombre: "",
  cargo: "",
  departamento: "",
  sueldo: 0,
};

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

const departmentPalette = [
  "bg-blue-50 text-blue-700 ring-blue-600/20",
  "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "bg-amber-50 text-amber-700 ring-amber-600/20",
  "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
  "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  "bg-rose-50 text-rose-700 ring-rose-600/20",
];

const badgeColor = (label: string) => {
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash + label.charCodeAt(i)) % departmentPalette.length;
  return departmentPalette[hash];
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30";

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<EmployeeInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editingId) {
        await updateEmployee(editingId, form);
      } else {
        await createEmployee(form);
      }
      resetForm();
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      nombre: employee.nombre,
      cargo: employee.cargo,
      departamento: employee.departamento,
      sueldo: employee.sueldo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    setError(null);
    try {
      await deleteEmployee(id);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar empleado");
    }
  };

  const stats = useMemo(() => {
    const total = employees.length;
    const nomina = employees.reduce((sum, e) => sum + e.sueldo, 0);
    const promedio = total > 0 ? nomina / total : 0;
    const departamentos = new Set(employees.map((e) => e.departamento)).size;
    return { total, nomina, promedio, departamentos };
  }, [employees]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-5.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5 0a4 4 0 1 0 0-8"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Gestión de Empleados
              </h1>
              <p className="text-sm text-slate-500">
                API:{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {process.env.NEXT_PUBLIC_API_URL}
                </code>
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Empleados" value={stats.total.toString()} />
          <StatCard label="Departamentos" value={stats.departamentos.toString()} />
          <StatCard label="Nómina total" value={currency.format(stats.nomina)} />
          <StatCard label="Sueldo promedio" value={currency.format(stats.promedio)} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            {editingId ? "Editar empleado" : "Nuevo empleado"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <input
                required
                placeholder="Ej. Ana Torres"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Cargo">
              <input
                required
                placeholder="Ej. Desarrolladora Backend"
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Departamento">
              <input
                required
                placeholder="Ej. Tecnología"
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Sueldo">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-slate-400">
                  $
                </span>
                <input
                  required
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={form.sueldo || ""}
                  onChange={(e) =>
                    setForm({ ...form, sueldo: Number(e.target.value) })
                  }
                  className={`${inputClass} pl-7`}
                />
              </div>
            </Field>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-5">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Guardando..."
                : editingId
                  ? "Actualizar empleado"
                  : "Crear empleado"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="mt-0.5 h-4 w-4 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Empleado</th>
                  <th className="px-5 py-3">Cargo</th>
                  <th className="px-5 py-3">Departamento</th>
                  <th className="px-5 py-3">Sueldo</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-5 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))}

                {!loading && employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="h-10 w-10"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-5.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm5 0a4 4 0 1 0 0-8"
                          />
                        </svg>
                        <p className="text-sm font-medium text-slate-500">
                          No hay empleados registrados
                        </p>
                        <p className="text-xs text-slate-400">
                          Usa el formulario de arriba para crear el primero.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                            {initials(employee.nombre)}
                          </div>
                          <span className="font-medium text-slate-800">
                            {employee.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {employee.cargo}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeColor(
                            employee.departamento,
                          )}`}
                        >
                          {employee.departamento}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {currency.format(employee.sueldo)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
