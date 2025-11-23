// src/app/admin/Dashboard.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ----------------------------------------------------------------- */
/*  Types (unchanged)                                                */
/* ----------------------------------------------------------------- */
type User = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  address?: string;
  city?: string;
  zip?: string;
  phone?: string;
  notes?: string;
  preferredDay1?: string;
  preferredTime1?: string;
  preferredDay2?: string;
  preferredTime2?: string;
  membershipEnabled?: boolean;
  isSubscribed?: boolean;
  stripeCustomerId?: string;
  createdAt?: string;
};

type Car = {
  id?: string;
  _id?: string;
  make?: string;
  model?: string;
  licensePlate?: string;
  color?: string;
  userId?: string | { id?: string; _id?: string };
  user?: string | { id?: string; _id?: string };
};

/* ----------------------------------------------------------------- */
/*  UI helpers – compact & consistent padding                        */
/* ----------------------------------------------------------------- */

/* ---------------------- Toast ------------------------------------- */
type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};
const Toast = ({ message, type = "success", onClose }: ToastProps) => {
  const border = type === "success" ? "border-green-500" : "border-red-500";
  return (
    <div
      role="alert"
      className={`
        fixed bottom-4 right-4 z-50 max-w-xs rounded-xl border-l-4 ${border}
        bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 p-3 shadow-lg
        animate-[slide-in-bottom_0.2s_ease-out]
      `}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          aria-label="Close toast"
          className="ml-3 rounded-full bg-gray-200/40 p-0.5 hover:bg-gray-200/60"
        >
          ×
        </button>
      </div>
    </div>
  );
};

/* ---------------------- Stat Card --------------------------------- */
type StatProps = { label: string; value: number | string };
const StatCard = ({ label, value }: StatProps) => (
  <div className="rounded-md bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
      {value}
    </p>
  </div>
);

/* ---------------------- Card -------------------------------------- */
type CardProps = { children: React.ReactNode; className?: string };
const Card = ({ children, className }: CardProps) => (
  <div
    className={`
      rounded-md bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700
      ${className ?? ""}
    `}
  >
    {children}
  </div>
);

/* ---------------------- Modal (responsive) ------------------------ */
type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** size is only about the **max‑width** on desktop; on mobile it always stretches full‑width */
  size?: "sm" | "md" | "lg";
};
const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  size = "md",
}: ModalProps) => {
  if (!open) return null;

  // map size → max‑width for desktop
  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
  }[size];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/70"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* panel – mobile full‑width, desktop capped by sizeMap */}
      <div
        className={`
          relative z-10 w-full max-w-full ${sizeMap} md:max-w-${sizeMap.split("-")[1]}
          rounded-xl bg-white dark:bg-gray-900 shadow-2xl
          max-h-[90vh] overflow-y-auto
        `}
      >
        <header className="flex items-center justify-between rounded-t-xl bg-[var(--accent)] p-3 text-white">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded bg-white/10 px-2 py-0.5 hover:bg-white/20"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>
        <section className="p-4">{children}</section>

        {actions && (
          <footer className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 p-3">
            {actions}
          </footer>
        )}
      </div>
    </div>
  );
};

/* ---------------------- User form (new user) ---------------------- */
type UserFormProps = {
  form: { name: string; email: string; role: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ name: string; email: string; role: string }>
  >;
  loading: boolean;
  onSubmit: (e?: FormEvent) => void;
  onCancel: () => void;
  isEdit: boolean;
};
const UserForm = ({
  form,
  setForm,
  loading,
  onSubmit,
  onCancel,
  isEdit,
}: UserFormProps) => {
  const inputCls =
    "w-full rounded border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-600 p-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input
          required
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Name"
          className={inputCls}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          placeholder="Email"
          className={inputCls}
        />
        <select
          value={form.role}
          onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          className={inputCls}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className={`
            flex-1 rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white
            hover:opacity-90 disabled:opacity-50
          `}
        >
          {isEdit
            ? loading
              ? "Saving…"
              : "Save"
            : loading
            ? "Creating…"
            : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/* ---------------------- Edit‑User modal (compact) ----------------- */
type EditUserModalProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  form: { name: string; email: string; role: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ name: string; email: string; role: string }>
  >;
  loading: boolean;
  onSave: () => void;
};
const EditUserModal = ({
  open,
  onClose,
  user,
  form,
  setForm,
  loading,
  onSave,
}: EditUserModalProps) => {
  if (!user) return null;
  const inputCls =
    "w-full rounded border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-600 p-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit user"
      size="sm"
      actions={
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className={`
            rounded bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white
            hover:opacity-90 disabled:opacity-50
          `}
        >
          {loading ? "Saving…" : "Save"}
        </button>
      }
    >
      <div className="space-y-3">
        <input
          required
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Name"
          className={inputCls}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          placeholder="Email"
          className={inputCls}
        />
        <select
          value={form.role}
          onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
          className={inputCls}
        >
          <option value="user">User</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
    </Modal>
  );
};

/* ---------------------- Full‑User modal (expand) ----------------- */
type CarPayload = {
  make: string;
  model: string;
  licensePlate: string;
  color?: string;
  userId: string;
};

type UserModalProps = {
  user: User | null;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  onSave: (e?: FormEvent) => void;
  onClose: () => void;
  cars: Car[];
  createCar: (payload: CarPayload) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
};
const UserModal = ({
  user,
  form,
  setForm,
  loading,
  onSave,
  onClose,
  cars,
  createCar,
  deleteCar,
}: UserModalProps) => {
  const [carForm, setCarForm] = useState({
    make: "",
    model: "",
    licensePlate: "",
    color: "",
  });
  const [carLoading, setCarLoading] = useState(false);

  if (!user) return null;

  const ownerId = user.id ?? user._id;
  const ownedCars = cars.filter((c) => {
    const raw = c.userId ?? c.user ?? null;
    let id = raw;
    if (raw && typeof raw === "object")
      id = (raw as any)._id ?? (raw as any).id ?? raw;
    return String(id) === String(ownerId);
  });

  const handleAddCar = async () => {
    if (!carForm.make || !carForm.model || !carForm.licensePlate) {
      alert("Make, model and license plate are required");
      return;
    }
    if (!ownerId) {
      alert("Missing user id");
      return;
    }
    setCarLoading(true);
    try {
      await createCar({ ...carForm, userId: ownerId });
      setCarForm({ make: "", model: "", licensePlate: "", color: "" });
    } catch (e) {
      console.error(e);
      alert((e as any).message ?? "Failed to add car");
    }
    setCarLoading(false);
  };

  const inputCls =
    "w-full rounded border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-600 p-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";

  return (
    <Modal open={!!user} onClose={onClose} title={form.name || "User"} size="lg">
      <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* ---------- LEFT: basic user fields ---------- */}
        <div className="space-y-3">
          <label className="block">
            <span className="text-gray-600">Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((s: any) => ({ ...s, phone: e.target.value }))}
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="text-gray-600">Address</span>
            <input
              value={form.address}
              onChange={(e) => setForm((s: any) => ({ ...s, address: e.target.value }))}
              className={inputCls}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-gray-600">City</span>
              <input
                value={form.city}
                onChange={(e) => setForm((s: any) => ({ ...s, city: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-gray-600">ZIP</span>
              <input
                value={form.zip}
                onChange={(e) => setForm((s: any) => ({ ...s, zip: e.target.value }))}
                className={inputCls}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-600">Notes</span>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>

        {/* ---------- RIGHT: preferences, role, cars ---------- */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-gray-600">Pref Day 1</span>
              <input
                value={form.preferredDay1}
                onChange={(e) => setForm((s: any) => ({ ...s, preferredDay1: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-gray-600">Pref Time 1</span>
              <input
                value={form.preferredTime1}
                onChange={(e) => setForm((s: any) => ({ ...s, preferredTime1: e.target.value }))}
                className={inputCls}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-gray-600">Pref Day 2</span>
              <input
                value={form.preferredDay2}
                onChange={(e) => setForm((s: any) => ({ ...s, preferredDay2: e.target.value }))}
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="text-gray-600">Pref Time 2</span>
              <input
                value={form.preferredTime2}
                onChange={(e) => setForm((s: any) => ({ ...s, preferredTime2: e.target.value }))}
                className={inputCls}
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1 text-gray-600">
              <input
                type="checkbox"
                checked={form.membershipEnabled}
                onChange={(e) =>
                  setForm((s: any) => ({ ...s, membershipEnabled: e.target.checked }))
                }
                className="rounded bg-gray-200 dark:bg-gray-600 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Membership enabled
            </label>

            <label className="flex items-center gap-1 text-gray-600">
              <input
                type="checkbox"
                checked={form.isSubscribed}
                onChange={(e) =>
                  setForm((s: any) => ({ ...s, isSubscribed: e.target.checked }))
                }
                className="rounded bg-gray-200 dark:bg-gray-600 text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Subscribed
            </label>
          </div>

          <label className="block">
            <span className="text-gray-600">Role</span>
            <select
              value={form.role}
              onChange={(e) => setForm((s: any) => ({ ...s, role: e.target.value }))}
              className={inputCls}
            >
              <option value="user">User</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {/* --------------- Cars owned by this user --------------- */}
          <div className="mt-3">
            <h4 className="mb-2 text-sm font-medium text-gray-700">Cars owned</h4>

            {/* existing car list */}
            <div className="space-y-1">
              {ownedCars.map((c) => (
                <div
                  key={c.id ?? c._id}
                  className="flex items-center justify-between rounded bg-gray-100 dark:bg-gray-800 p-1.5 text-xs"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {c.make} {c.model}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {c.licensePlate}
                      {c.color ? ` • ${c.color}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Delete this car?")) return;
                      await deleteCar(c.id ?? c._id!);
                    }}
                    className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {/* add‑car form (compact, responsive) */}
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input
                placeholder="Make"
                value={carForm.make}
                onChange={(e) => setCarForm((s) => ({ ...s, make: e.target.value }))}
                className={inputCls}
              />
              <input
                placeholder="Model"
                value={carForm.model}
                onChange={(e) => setCarForm((s) => ({ ...s, model: e.target.value }))}
                className={inputCls}
              />
              <input
                placeholder="License"
                value={carForm.licensePlate}
                onChange={(e) => setCarForm((s) => ({ ...s, licensePlate: e.target.value }))}
                className={inputCls}
              />
              <div className="flex gap-2">
                <input
                  placeholder="Color (opt.)"
                  value={carForm.color}
                  onChange={(e) => setCarForm((s) => ({ ...s, color: e.target.value }))}
                  className={inputCls}
                />
                <button
                  type="button"
                  disabled={carLoading}
                  onClick={handleAddCar}
                  className="rounded bg-[var(--accent)] px-3 py-1 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {carLoading ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          </div>
          {/* ------------------------------------------------------ */}
        </div>
      </form>
    </Modal>
  );
};

/* ---------------------- Users table (compact) -------------------- */
type UserTableProps = {
  users: User[];
  cars: Car[];
  onEditUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  onExpandUser: (u: User) => void;
};
const UserTable = ({
  users,
  cars,
  onEditUser,
  onDeleteUser,
  onExpandUser,
}: UserTableProps) => {
  // Build a map of userId → car count for fast lookup
  const carCountMap = new Map<string, number>();
  cars.forEach((c) => {
    const raw = c.userId ?? c.user ?? null;
    let id = raw;
    if (raw && typeof raw === "object")
      id = (raw as any)._id ?? (raw as any).id ?? raw;
    const key = String(id);
    carCountMap.set(key, (carCountMap.get(key) ?? 0) + 1);
  });

  const iconBtn = (
    className: string,
    aria: string,
    onClick: () => void,
    icon: React.ReactNode,
  ) => (
    <button
      onClick={onClick}
      className={className}
      aria-label={aria}
      type="button"
    >
      {icon}
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="w-full table-auto text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-300">
              Name
            </th>
            <th className="p-2 text-left font-medium text-gray-600 dark:text-gray-300">
              Email
            </th>
            <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-300">
              Role
            </th>
            <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-300">
              Cars
            </th>
            <th className="p-2 text-center font-medium text-gray-600 dark:text-gray-300">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((u) => {
            const uid = u.id ?? u._id!;
            const carCount = carCountMap.get(String(uid)) ?? 0;
            return (
              <tr key={uid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-2 font-medium text-gray-900 dark:text-gray-100">
                  {u.name ?? "—"}
                </td>
                <td className="p-2 text-gray-600 dark:text-gray-300">{u.email}</td>
                <td className="p-2 text-center text-gray-600 dark:text-gray-300">
                  {u.role}
                </td>
                <td className="p-2 text-center text-gray-600 dark:text-gray-300">
                  {carCount}
                </td>
                <td className="p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Edit – opens compact edit modal */}
                    {iconBtn(
                      "rounded bg-gray-200 dark:bg-gray-700 p-1 hover:bg-gray-300 dark:hover:bg-gray-600",
                      "Edit user",
                      () => onEditUser(u),
                      <svg
                        className="h-4 w-4 text-gray-600 dark:text-gray-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>,
                    )}

                    {/* Expand – opens full‑screen modal */}
                    {iconBtn(
                      "rounded bg-[var(--accent)] p-1 text-white hover:opacity-90",
                      "Expand user",
                      () => onExpandUser(u),
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M2 12h3m6-9v3m6 12h3m-12-6h12" />
                      </svg>,
                    )}

                    {/* Delete */}
                    {iconBtn(
                      "rounded bg-red-600 p-1 text-white hover:bg-red-700",
                      "Delete user",
                      () => onDeleteUser(uid),
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>,
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ----------------------------------------------------------------- */
/*  Main Dashboard component – compact & responsive                  */
/* ----------------------------------------------------------------- */
export function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  /* ---------------------- state ---------------------- */
  const [stats, setStats] = useState({
    userCount: 0,
    activeUsers: 0,
    carCount: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  // create‑new‑user
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // edit‑user modal (compact)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });

  // full‑user modal (expand)
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [modalForm, setModalForm] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // toast handling
  const [toast, setToast] = useState<{
    msg: string;
    type?: "success" | "error";
  } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") =>
    setToast({ msg, type });

  /* ---------------------- data load ---------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, usersRes, carsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/cars"),
        ]);
        setStats(await statsRes.json());
        setUsers(await usersRes.json());
        setCars(await carsRes.json());
      } catch (e) {
        console.error(e);
        showToast("Failed to load admin data", "error");
      }
    };
    load();
  }, []);

  const refreshUsers = async () => {
    try {
      const r = await fetch("/api/admin/users");
      setUsers(await r.json());
    } catch (e) {
      console.error(e);
      showToast("Failed to refresh users", "error");
    }
  };
  const refreshCars = async () => {
    try {
      const r = await fetch("/api/admin/cars");
      setCars(await r.json());
    } catch (e) {
      console.error(e);
      showToast("Failed to refresh cars", "error");
    }
  };

  /* ---------------------- CRUD helpers ---------------------- */
  const createUser = async (e?: FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshUsers();
      setShowCreate(false);
      setCreateForm({ name: "", email: "", role: "user" });
      showToast("User created");
    } catch (e: any) {
      setError(e.message ?? "Failed to create user");
      showToast(e.message ?? "Failed to create user", "error");
    } finally {
      setLoading(false);
    }
  };

  const saveEditUser = async () => {
    if (!editingUser) return;
    setLoading(true);
    setError(null);
    try {
      const id = editingUser.id ?? editingUser._id!;
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshUsers();
      setEditModalOpen(false);
      setEditingUser(null);
      showToast("User updated");
    } catch (e: any) {
      setError(e.message ?? "Failed to update user");
      showToast(e.message ?? "Failed to update user", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      setUsers((u) => u.filter((x) => (x.id ?? x._id) !== id));
      showToast("User deleted");
    } catch (e: any) {
      setError(e.message ?? "Failed to delete user");
      showToast(e.message ?? "Failed to delete user", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role ?? "user",
    });
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingUser(null);
  };

  const openModal = (user: User) => {
    setModalUser(user);
    setModalForm({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      city: user.city ?? "",
      zip: user.zip ?? "",
      notes: user.notes ?? "",
      preferredDay1: user.preferredDay1 ?? "",
      preferredTime1: user.preferredTime1 ?? "",
      preferredDay2: user.preferredDay2 ?? "",
      preferredTime2: user.preferredTime2 ?? "",
      membershipEnabled: !!user.membershipEnabled,
      isSubscribed: !!user.isSubscribed,
      role: user.role ?? "user",
    });
  };
  const closeModal = () => {
    setModalUser(null);
    setModalForm(null);
  };
  const saveModal = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!modalUser || !modalForm) return;
    setModalLoading(true);
    try {
      const id = modalUser.id ?? modalUser._id!;
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalForm),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshUsers();
      closeModal();
      showToast("User saved");
    } catch (e: any) {
      setError(e.message ?? "Failed to save user");
      showToast(e.message ?? "Failed to save user", "error");
    } finally {
      setModalLoading(false);
    }
  };

  // Car CRUD (used inside the full user modal)
  const createCar = async (payload: CarPayload) => {
    try {
      const r = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshCars();
      await refreshUsers();
    } catch (e) {
      console.error(e);
      showToast("Failed to add car", "error");
      throw e;
    }
  };
  const deleteCar = async (id: string) => {
    try {
      const r = await fetch("/api/admin/cars", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshCars();
      await refreshUsers();
    } catch (e) {
      console.error(e);
      showToast("Failed to delete car", "error");
      throw e;
    }
  };

  /* ---------------------- auth guard ---------------------- */
  if (!session?.user) {
    return <p className="p-8 text-gray-800">Loading session…</p>;
  }

  /* ---------------------- render ---------------------- */
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      {/* toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="mb-6 flex flex-col items-start justify-between gap-4 rounded-xl bg-white dark:bg-gray-800 p-4 md:flex-row md:items-center border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage users & view stats
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Sign out
        </button>
      </header>

      {/* KPI cards */}
      <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Total Users" value={stats.userCount} />
        <StatCard label="Active Users" value={stats.activeUsers} />
        <StatCard label="Cars" value={stats.carCount} />
      </section>

      {/* Users list & actions */}
      <section className="space-y-4">
        <Card className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Users
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowCreate((s) => !s);
                setCreateForm({ name: "", email: "", role: "user" });
              }}
              className="rounded bg-[var(--accent)] px-3 py-1 text-sm font-medium text-white hover:opacity-90"
            >
              {showCreate ? "Close" : "New User"}
            </button>
            <button
              onClick={() => {
                refreshUsers();
                refreshCars();
              }}
              className="rounded bg-gray-200 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
        </Card>

        {/* error */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* create‑user form (inline) */}
        {showCreate && (
          <Card>
            <UserForm
              form={createForm}
              setForm={setCreateForm}
              loading={loading}
              onSubmit={createUser}
              onCancel={() => setShowCreate(false)}
              isEdit={false}
            />
          </Card>
        )}

        {/* compact users table */}
        <UserTable
          users={users}
          cars={cars}
          onEditUser={openEditModal}
          onDeleteUser={deleteUser}
          onExpandUser={openModal}
        />
      </section>

      {/* Edit‑User modal (compact) */}
      <EditUserModal
        open={editModalOpen}
        onClose={closeEditModal}
        user={editingUser}
        form={editForm}
        setForm={setEditForm}
        loading={loading}
        onSave={saveEditUser}
      />

      {/* Full‑User modal (expand) */}
      <UserModal
        user={modalUser}
        form={modalForm}
        setForm={setModalForm}
        loading={modalLoading}
        onSave={saveModal}
        onClose={closeModal}
        cars={cars}
        createCar={createCar}
        deleteCar={deleteCar}
      />
    </main>
  );
}
