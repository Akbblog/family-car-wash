// src/app/admin/Dashboard.tsx
"use client";

import { useState, useEffect, FormEvent, Fragment } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

// small helper to safely read optional props or provide a fallback
const propsOr = <T,>(v: T | undefined, fallback: T): T => (typeof v === "undefined" ? fallback : v);

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
  updatedAt?: string;
  waitlistStatus?: "none" | "joined";
  waitlistJoinedAt?: string;
  authProvider?: string;
  image?: string;
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
  <div className="rounded-xl bg-[#111] border border-white/5 p-6 text-center">
    <p className="text-xs font-bold text-[#999] uppercase tracking-widest">{label}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
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
  // pagination controls passed from parent dashboard
  carsPage?: number;
  carsTotalPages?: number;
  setCarsPage?: React.Dispatch<React.SetStateAction<number>>;
  refreshCars?: (page?: number) => Promise<void>;
  showToast?: (msg: string, type?: "success" | "error") => void;
  askConfirm?: (message: string, onConfirm: () => Promise<void>) => void;
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
  carsPage,
  carsTotalPages,
  setCarsPage,
  refreshCars,
  showToast = () => {},
  askConfirm = () => {},
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
      showToast("Make, model and license plate are required", "error");
      return;
    }
    if (!ownerId) {
      showToast("Missing user id", "error");
      return;
    }
    setCarLoading(true);
    try {
      await createCar({ ...carForm, userId: ownerId });
      setCarForm({ make: "", model: "", licensePlate: "", color: "" });
    } catch (e) {
      console.error(e);
      showToast((e as any).message ?? "Failed to add car", "error");
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

            {/* cars pagination controls (if provided) */}
            {(typeof (UserModal as any) !== 'undefined') && (
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Page {propsOr(carsPage, 1)} of {propsOr(carsTotalPages, 1)}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const first = 1;
                      propsOr(setCarsPage, (n: number) => {}) (first);
                      await propsOr(refreshCars, async (p?: number) => {}) (first);
                    }}
                    disabled={propsOr(carsPage, 1) <= 1}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${propsOr(carsPage, 1) <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
                  >
                    First
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const prev = Math.max(1, (propsOr(carsPage, 1) || 1) - 1);
                      propsOr(setCarsPage, (n: number) => {}) (prev);
                      await propsOr(refreshCars, async (p?: number) => {}) (prev);
                    }}
                    disabled={propsOr(carsPage, 1) <= 1}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${propsOr(carsPage, 1) <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
                  >
                    Prev
                  </button>

                  {/* direct page input */}
                  <input
                    type="number"
                    min={1}
                    max={propsOr(carsTotalPages, 1)}
                    value={propsOr(carsPage, 1)}
                    onChange={async (e) => {
                      const v = Math.max(1, Math.min(propsOr(carsTotalPages, 1), Number(e.target.value || 1)));
                      propsOr(setCarsPage, (n: number) => {}) (v);
                      await propsOr(refreshCars, async (p?: number) => {}) (v);
                    }}
                    className="w-16 rounded border border-gray-300 bg-white dark:bg-gray-900 p-1 text-xs text-gray-900 dark:text-gray-100"
                  />

                  <button
                    type="button"
                    onClick={async () => {
                      const next = Math.min(propsOr(carsTotalPages, 1), (propsOr(carsPage, 1) || 1) + 1);
                      propsOr(setCarsPage, (n: number) => {}) (next);
                      await propsOr(refreshCars, async (p?: number) => {}) (next);
                    }}
                    disabled={propsOr(carsPage, 1) >= propsOr(carsTotalPages, 1)}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${propsOr(carsPage, 1) >= propsOr(carsTotalPages, 1) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const last = propsOr(carsTotalPages, 1);
                      propsOr(setCarsPage, (n: number) => {}) (last);
                      await propsOr(refreshCars, async (p?: number) => {}) (last);
                    }}
                    disabled={propsOr(carsPage, 1) >= propsOr(carsTotalPages, 1)}
                    className={`rounded px-2 py-0.5 text-xs font-medium ${propsOr(carsPage, 1) >= propsOr(carsTotalPages, 1) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
                  >
                    Last
                  </button>
                </div>
              </div>
            )}

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
  onDeleteUser: (id: string) => void;
  createCar: (payload: CarPayload) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  refreshUsers: (page?: number) => Promise<void>;
  expandedUserId?: string | null;
  onToggleExpand?: (id: string) => void;
  onRequestDeleteCar?: (id: string) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
  askConfirm?: (message: string, onConfirm: () => Promise<void>) => void;
};
const UserTable = ({
  users,
  cars,
  onDeleteUser,
  createCar,
  deleteCar,
  refreshUsers,
  expandedUserId,
  onToggleExpand,
  onRequestDeleteCar,
  showToast = () => {},
  askConfirm = () => {},
}: UserTableProps) => {
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  // Get expanded user's form data
  const expandedUser = expandedUserId ? users.find(u => String(u.id ?? u._id!) === expandedUserId) : null;
  const [form, setForm] = useState<any>(expandedUser ? {
    name: expandedUser.name || "",
    email: expandedUser.email || "",
    phone: expandedUser.phone || "",
    address: expandedUser.address || "",
    city: expandedUser.city || "",
    zip: expandedUser.zip || "",
    notes: expandedUser.notes || "",
    preferredDay1: expandedUser.preferredDay1 || "",
    preferredTime1: expandedUser.preferredTime1 || "",
    preferredDay2: expandedUser.preferredDay2 || "",
    preferredTime2: expandedUser.preferredTime2 || "",
    membershipEnabled: !!expandedUser.membershipEnabled,
    isSubscribed: !!expandedUser.isSubscribed,
    role: expandedUser.role || "user",
  } : {});

  // Update form when expandedUser changes
  useEffect(() => {
    if (expandedUser) {
      setForm({
        name: expandedUser.name || "",
        email: expandedUser.email || "",
        phone: expandedUser.phone || "",
        address: expandedUser.address || "",
        city: expandedUser.city || "",
        zip: expandedUser.zip || "",
        notes: expandedUser.notes || "",
        preferredDay1: expandedUser.preferredDay1 || "",
        preferredTime1: expandedUser.preferredTime1 || "",
        preferredDay2: expandedUser.preferredDay2 || "",
        preferredTime2: expandedUser.preferredTime2 || "",
        membershipEnabled: !!expandedUser.membershipEnabled,
        isSubscribed: !!expandedUser.isSubscribed,
        role: expandedUser.role || "user",
      });
      setShowDetails(false);
    }
  }, [expandedUser]);

  const ownedCars = expandedUser ? cars.filter((c) => {
    const raw = c.userId ?? c.user ?? null;
    let id = raw;
    if (raw && typeof raw === "object") id = (raw as any)._id ?? (raw as any).id ?? raw;
    return String(id) === String(expandedUser.id ?? expandedUser._id!);
  }) : [];

  const save = async () => {
    if (!expandedUser) return;
    setSaving(true);
    try {
      const id = expandedUser.id ?? expandedUser._id!;
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshUsers();
      onToggleExpand && onToggleExpand("");
      showToast("User updated", "success");
    } catch (e) {
      console.error(e);
      showToast((e as any)?.message ?? "Failed to save", "error");
    }
    setSaving(false);
  };

  // Car add form
  const [carForm, setCarForm] = useState({ make: "", model: "", licensePlate: "", color: "" });
  const [carLoading, setCarLoading] = useState(false);
  const handleAddCar = async () => {
    if (!carForm.make || !carForm.model || !carForm.licensePlate) {
      showToast("Make, model and license plate are required", "error");
      return;
    }
    if (!expandedUser) return showToast("Missing user", "error");
    setCarLoading(true);
    try {
      await createCar({ ...carForm, userId: String(expandedUser.id ?? expandedUser._id!) });
      setCarForm({ make: "", model: "", licensePlate: "", color: "" });
      showToast("Car added", "success");
    } catch (e) {
      console.error(e);
      showToast((e as any)?.message ?? "Failed to add car", "error");
    }
    setCarLoading(false);
  };

  const inputCls = "w-full bg-black border border-white/10 px-3 py-2 text-white text-xs rounded";
  const labelCls = "text-[10px] text-[#999] uppercase tracking-widest mb-1 block";

  const formatDate = (d?: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="w-full table-auto text-sm">
        <thead className="bg-[#111] border-b border-white/10">
          <tr>
            <th className="p-3 text-left font-medium text-[#999] uppercase tracking-widest text-xs">
              Name
            </th>
            <th className="p-3 text-left font-medium text-[#999] uppercase tracking-widest text-xs">
              Email
            </th>
            <th className="p-3 text-center font-medium text-[#999] uppercase tracking-widest text-xs">
              Role
            </th>
            <th className="p-3 text-center font-medium text-[#999] uppercase tracking-widest text-xs">
              Cars
            </th>
            <th className="p-3 text-center font-medium text-[#999] uppercase tracking-widest text-xs">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((u) => {
            const uid = String(u.id ?? u._id!);
            const carCount = carCountMap.get(uid) ?? 0;
            const isExpanded = expandedUserId === uid;
            return (
              <Fragment key={uid}>
                <tr className="bg-[#0a0a0a] hover:bg-[#111] transition-colors">
                  <td className="p-3 font-medium text-white">
                    {u.name ?? "—"}
                  </td>
                  <td className="p-3 text-white/70">{u.email}</td>
                  <td className="p-3 text-center text-white/70">
                    {u.role}
                  </td>
                  <td className="p-3 text-center text-white/70">
                    {carCount}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onToggleExpand && onToggleExpand(uid)}
                        className="rounded bg-[#ff3366] px-3 py-1 text-xs text-white hover:bg-[#ff1149] transition-colors font-medium"
                      >
                        {isExpanded ? "Hide" : "Manage"}
                      </button>
                      <button
                        onClick={() => onDeleteUser(uid)}
                        className="rounded bg-red-600/20 border border-red-600/50 px-3 py-1 text-xs text-red-300 hover:bg-red-600/30 transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded row – inline below user */}
                {isExpanded && expandedUser && (
                  <tr className="bg-[#111] border-t border-white/10">
                    <td colSpan={5} className="p-6">
                      <div className="space-y-4 max-w-4xl">
                        {/* Location & Contact */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Location & Contact</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                              <label className={labelCls}>Name</label>
                              <input value={form.name} onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} placeholder="Full name" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Email</label>
                              <input value={form.email} onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))} placeholder="user@example.com" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Phone</label>
                              <input value={form.phone} onChange={(e) => setForm((s: any) => ({ ...s, phone: e.target.value }))} placeholder="(555) 123-4567" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Street Address</label>
                              <input value={form.address} onChange={(e) => setForm((s: any) => ({ ...s, address: e.target.value }))} placeholder="123 Main St" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>City</label>
                              <input value={form.city} onChange={(e) => setForm((s: any) => ({ ...s, city: e.target.value }))} placeholder="City" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>ZIP Code</label>
                              <input value={form.zip} onChange={(e) => setForm((s: any) => ({ ...s, zip: e.target.value }))} placeholder="12345" className={inputCls} />
                            </div>
                          </div>
                        </div>

                        {/* Scheduling & Membership */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <h4 className="text-xs font-bold text-white uppercase tracking-widest">Scheduling & Membership</h4>
                          <div>
                            <label className={labelCls}>Service Notes</label>
                            <textarea value={form.notes} onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))} placeholder="Any special notes..." rows={2} className={inputCls} />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <label className={labelCls}>Preferred Day 1</label>
                              <input value={form.preferredDay1} onChange={(e) => setForm((s: any) => ({ ...s, preferredDay1: e.target.value }))} placeholder="Monday" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Preferred Time 1</label>
                              <input value={form.preferredTime1} onChange={(e) => setForm((s: any) => ({ ...s, preferredTime1: e.target.value }))} placeholder="9:00 AM" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Preferred Day 2</label>
                              <input value={form.preferredDay2} onChange={(e) => setForm((s: any) => ({ ...s, preferredDay2: e.target.value }))} placeholder="Wednesday" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Preferred Time 2</label>
                              <input value={form.preferredTime2} onChange={(e) => setForm((s: any) => ({ ...s, preferredTime2: e.target.value }))} placeholder="2:00 PM" className={inputCls} />
                            </div>
                          </div>
                          <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                              <input type="checkbox" checked={form.membershipEnabled} onChange={(e) => setForm((s: any) => ({ ...s, membershipEnabled: e.target.checked }))} className="w-3 h-3" />
                              <span>Membership Enabled</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                              <input type="checkbox" checked={form.isSubscribed} onChange={(e) => setForm((s: any) => ({ ...s, isSubscribed: e.target.checked }))} className="w-3 h-3" />
                              <span>Is Subscribed</span>
                            </label>
                          </div>
                        </div>

                        {/* Account & Cars */}
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Account & Cars</h4>
                            <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-[#ff3366] hover:text-white">
                              {showDetails ? "Hide" : "View"} Details
                            </button>
                          </div>

                          {showDetails && (
                            <div className="text-xs text-white/60 space-y-1 p-3 bg-black/30 rounded">
                              <div><strong>Role:</strong> {form.role}</div>
                              <div><strong>Created:</strong> {formatDate(expandedUser.createdAt)}</div>
                              <div><strong>Updated:</strong> {formatDate(expandedUser.updatedAt)}</div>
                              <div><strong>Auth Provider:</strong> {expandedUser.authProvider || "credentials"}</div>
                            </div>
                          )}

                          <div>
                            <label className={labelCls}>User Role</label>
                            <select value={form.role} onChange={(e) => setForm((s: any) => ({ ...s, role: e.target.value }))} className={inputCls}>
                              <option value="user">User</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>

                          {/* Cars */}
                          <div>
                            <label className={labelCls}>Owned Cars ({ownedCars.length})</label>
                            <div className="space-y-2 mb-3">
                              {ownedCars.length > 0 ? (
                                ownedCars.map((c) => (
                                  <div key={String(c.id ?? c._id)} className="flex items-center justify-between bg-black/40 p-2 rounded text-xs">
                                    <div>
                                      <div className="font-medium text-white">{c.make} {c.model}</div>
                                      <div className="text-white/60">{c.licensePlate}{c.color ? ` • ${c.color}` : ""}</div>
                                    </div>
                                    <button onClick={() => onRequestDeleteCar && onRequestDeleteCar(String(c.id ?? c._id))} className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:opacity-90">
                                      Remove
                                    </button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-white/50 italic">No cars registered</div>
                              )}
                            </div>

                            {/* Add Car */}
                            <div className="space-y-2 pt-2 border-t border-white/10">
                              <label className={labelCls}>Add New Car</label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <input placeholder="Make" value={carForm.make} onChange={(e) => setCarForm(s => ({ ...s, make: e.target.value }))} className={inputCls} />
                                <input placeholder="Model" value={carForm.model} onChange={(e) => setCarForm(s => ({ ...s, model: e.target.value }))} className={inputCls} />
                                <input placeholder="License Plate" value={carForm.licensePlate} onChange={(e) => setCarForm(s => ({ ...s, licensePlate: e.target.value }))} className={inputCls} />
                                <input placeholder="Color" value={carForm.color} onChange={(e) => setCarForm(s => ({ ...s, color: e.target.value }))} className={inputCls} />
                              </div>
                              <button onClick={handleAddCar} disabled={carLoading} className="w-full px-3 py-2 bg-[var(--accent)] text-white rounded text-xs font-medium hover:opacity-90 disabled:opacity-50">
                                {carLoading ? "Adding..." : "Add Car"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Save/Cancel */}
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                          <button onClick={save} disabled={saving} className="flex-1 px-3 py-2 bg-white text-black rounded font-semibold text-xs hover:opacity-90 disabled:opacity-50">
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                          <button onClick={() => onToggleExpand && onToggleExpand("")} className="flex-1 px-3 py-2 border border-white/10 text-white rounded text-xs hover:bg-white/5">
                            Close
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ---------------------- User Card (Comprehensive Admin View) ---------------------- */
type UserCardProps = {
  user: User;
  cars: Car[];
  carCount: number;
  onDeleteUser: (id: string) => void;
  createCar: (payload: CarPayload) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  refreshUsers: (page?: number) => Promise<void>;
  isOpen?: boolean;
  onToggle?: () => void;
  onRequestDeleteCar?: (id: string) => void;
  showToast?: (msg: string, type?: "success" | "error") => void;
};

const UserCard = ({ 
  user, 
  cars, 
  carCount, 
  onDeleteUser, 
  createCar, 
  deleteCar, 
  refreshUsers, 
  isOpen = false, 
  onToggle, 
  onRequestDeleteCar, 
  showToast = () => {} 
}: UserCardProps) => {
  const [saving, setSaving] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [form, setForm] = useState<any>({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    address: user.address || "",
    city: user.city || "",
    zip: user.zip || "",
    notes: user.notes || "",
    preferredDay1: user.preferredDay1 || "",
    preferredTime1: user.preferredTime1 || "",
    preferredDay2: user.preferredDay2 || "",
    preferredTime2: user.preferredTime2 || "",
    membershipEnabled: !!user.membershipEnabled,
    isSubscribed: !!user.isSubscribed,
    role: user.role || "user",
  });

  const ownerId = user.id ?? user._id;
  const ownedCars = cars.filter((c) => {
    const raw = c.userId ?? c.user ?? null;
    let id = raw;
    if (raw && typeof raw === "object") id = (raw as any)._id ?? (raw as any).id ?? raw;
    return String(id) === String(ownerId);
  });

  const save = async () => {
    setSaving(true);
    try {
      const id = user.id ?? user._id!;
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error(await r.text());
      await refreshUsers();
      onToggle && onToggle();
      showToast("User updated", "success");
    } catch (e) {
      console.error(e);
      showToast((e as any)?.message ?? "Failed to save", "error");
    }
    setSaving(false);
  };

  // Car add form
  const [carForm, setCarForm] = useState({ make: "", model: "", licensePlate: "", color: "" });
  const [carLoading, setCarLoading] = useState(false);
  const handleAddCar = async () => {
    if (!carForm.make || !carForm.model || !carForm.licensePlate) {
      showToast("Make, model and license plate are required", "error");
      return;
    }
    if (!ownerId) return showToast("Missing user id", "error");
    setCarLoading(true);
    try {
      await createCar({ ...carForm, userId: String(ownerId) });
      setCarForm({ make: "", model: "", licensePlate: "", color: "" });
      showToast("Car added", "success");
    } catch (e) {
      console.error(e);
      showToast((e as any)?.message ?? "Failed to add car", "error");
    }
    setCarLoading(false);
  };

  const inputCls = "w-full bg-black border border-white/10 px-4 py-3 text-white text-sm rounded";
  const labelCls = "text-[11px] text-[#999] uppercase tracking-widest mb-2 block";

  // Format date for display
  const formatDate = (d?: string) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d;
    }
  };

  return (
    <div className={`bg-[#111] border border-white/5 p-6 rounded-xl transition-all min-h-[200px]`}>
      {/* ========== CARD HEADER (Always visible) ========== */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-sm font-bold text-white">{user.name || "—"}</div>
            <span className={`px-2 py-1 text-xs rounded font-medium ${
              user.role === "admin" ? "bg-red-600/20 text-red-300" : 
              user.role === "editor" ? "bg-blue-600/20 text-blue-300" : 
              "bg-white/10 text-white/70"
            }`}>
              {user.role?.toUpperCase() || "USER"}
            </span>
            <span className={`px-2 py-1 text-xs rounded font-medium ${
              user.isSubscribed ? "bg-green-600/20 text-green-300" : "bg-gray-600/20 text-gray-300"
            }`}>
              {user.isSubscribed ? "SUBSCRIBED" : "FREE"}
            </span>
          </div>
          <div className="text-xs text-white/70 mb-1">{user.email}</div>
          <div className="text-xs text-white/50">Joined: {formatDate(user.createdAt)}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-white/70 mb-3">Cars: {carCount}</div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => onToggle && onToggle()} 
              className="px-4 py-2 text-xs bg-[var(--accent)] text-white rounded font-medium hover:opacity-90"
            >
              {isOpen ? "Hide" : "Manage"}
            </button>
            <button 
              onClick={() => onDeleteUser(String(ownerId))} 
              className="px-4 py-2 text-xs bg-red-600 text-white rounded font-medium hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* ========== EXPANDED FORM (AddressForm-style three steps) ========== */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
          {/* LOCATION & CONTACT */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Location & Contact</h3>
            
            <div>
              <label className={labelCls}>Name</label>
              <input 
                value={form.name} 
                onChange={(e) => setForm((s: any) => ({ ...s, name: e.target.value }))} 
                placeholder="Full name"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Email</label>
              <input 
                value={form.email} 
                onChange={(e) => setForm((s: any) => ({ ...s, email: e.target.value }))} 
                placeholder="user@example.com"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Phone</label>
              <input 
                value={form.phone} 
                onChange={(e) => setForm((s: any) => ({ ...s, phone: e.target.value }))} 
                placeholder="(555) 123-4567"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Street Address</label>
              <input 
                value={form.address} 
                onChange={(e) => setForm((s: any) => ({ ...s, address: e.target.value }))} 
                placeholder="123 Main St"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>City</label>
                <input 
                  value={form.city} 
                  onChange={(e) => setForm((s: any) => ({ ...s, city: e.target.value }))} 
                  placeholder="City"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>ZIP Code</label>
                <input 
                  value={form.zip} 
                  onChange={(e) => setForm((s: any) => ({ ...s, zip: e.target.value }))} 
                  placeholder="12345"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* SCHEDULING & MEMBERSHIP */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Scheduling & Membership</h3>
            
            <div>
              <label className={labelCls}>Service Notes</label>
              <textarea 
                value={form.notes} 
                onChange={(e) => setForm((s: any) => ({ ...s, notes: e.target.value }))} 
                placeholder="Any special notes or requests..."
                rows={3}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Preferred Day 1</label>
                <input 
                  value={form.preferredDay1} 
                  onChange={(e) => setForm((s: any) => ({ ...s, preferredDay1: e.target.value }))} 
                  placeholder="Monday"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Preferred Time 1</label>
                <input 
                  value={form.preferredTime1} 
                  onChange={(e) => setForm((s: any) => ({ ...s, preferredTime1: e.target.value }))} 
                  placeholder="9:00 AM"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Preferred Day 2</label>
                <input 
                  value={form.preferredDay2} 
                  onChange={(e) => setForm((s: any) => ({ ...s, preferredDay2: e.target.value }))} 
                  placeholder="Wednesday"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Preferred Time 2</label>
                <input 
                  value={form.preferredTime2} 
                  onChange={(e) => setForm((s: any) => ({ ...s, preferredTime2: e.target.value }))} 
                  placeholder="2:00 PM"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.membershipEnabled}
                  onChange={(e) => setForm((s: any) => ({ ...s, membershipEnabled: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Membership Enabled</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                <input 
                  type="checkbox"
                  checked={form.isSubscribed}
                  onChange={(e) => setForm((s: any) => ({ ...s, isSubscribed: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span>Is Subscribed</span>
              </label>
            </div>
          </div>

          {/* ACCOUNT & ROLES + CARS */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Account & Cars</h3>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-[#ff3366] hover:text-white"
              >
                {showDetails ? "Hide" : "View / Edit"} Details
              </button>
            </div>

            {/* Account Details (collapsible) */}
            {showDetails && (
              <div className="space-y-4 p-4 bg-gray-900/30 rounded border border-white/5">
                <div>
                  <label className={labelCls}>User Role</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm((s: any) => ({ ...s, role: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="text-xs text-white/60 space-y-1">
                  <div><strong>Created:</strong> {formatDate(user.createdAt)}</div>
                  <div><strong>Last Updated:</strong> {formatDate(user.updatedAt)}</div>
                  <div><strong>Auth Provider:</strong> {user.authProvider || "credentials"}</div>
                  <div><strong>Waitlist Status:</strong> {user.waitlistStatus || "none"}</div>
                  {user.stripeCustomerId && (
                    <div><strong>Stripe ID:</strong> {user.stripeCustomerId.slice(0, 15)}...</div>
                  )}
                </div>
              </div>
            )}

            {/* Cars Management */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Owned Cars</label>
              
              {ownedCars.length > 0 ? (
                <div className="space-y-2">
                  {ownedCars.map((c) => (
                    <div key={c.id ?? c._id} className="flex items-center justify-between bg-gray-900/30 p-3 rounded border border-white/5">
                      <div>
                        <div className="font-medium text-white text-sm">{c.make} {c.model}</div>
                        <div className="text-xs text-white/60">{c.licensePlate}{c.color ? ` • ${c.color}` : ""}</div>
                      </div>
                      <button 
                        onClick={() => {
                          if (typeof onRequestDeleteCar === "function") {
                            onRequestDeleteCar(String(c.id ?? c._id));
                          } else {
                            deleteCar(String(c.id ?? c._id));
                          }
                        }}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:opacity-90"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-white/60 italic">No cars registered</div>
              )}

              {/* Add Car Form */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <label className="text-xs font-bold text-white uppercase tracking-widest block">Add New Car</label>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="Make" 
                    value={carForm.make} 
                    onChange={(e) => setCarForm(s => ({ ...s, make: e.target.value }))} 
                    className={inputCls}
                  />
                  <input 
                    placeholder="Model" 
                    value={carForm.model} 
                    onChange={(e) => setCarForm(s => ({ ...s, model: e.target.value }))} 
                    className={inputCls}
                  />
                  <input 
                    placeholder="License Plate" 
                    value={carForm.licensePlate} 
                    onChange={(e) => setCarForm(s => ({ ...s, licensePlate: e.target.value }))} 
                    className={inputCls}
                  />
                  <input 
                    placeholder="Color (optional)" 
                    value={carForm.color} 
                    onChange={(e) => setCarForm(s => ({ ...s, color: e.target.value }))} 
                    className={inputCls}
                  />
                </div>
                <button 
                  onClick={handleAddCar} 
                  disabled={carLoading}
                  className="w-full px-4 py-2 bg-[var(--accent)] text-white rounded font-medium text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {carLoading ? "Adding..." : "Add Car"}
                </button>
              </div>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-3 pt-6 border-t border-white/10">
            <button 
              onClick={save} 
              disabled={saving}
              className="flex-1 px-4 py-3 bg-white text-black rounded font-semibold text-sm hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button 
              onClick={() => onToggle && onToggle()}
              className="flex-1 px-4 py-3 border border-white/10 text-white rounded font-semibold text-sm hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
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
  // Pagination state for users and cars (default limit 25)
  const [usersPage, setUsersPage] = useState<number>(1);
  const [usersTotalPages, setUsersTotalPages] = useState<number>(1);
  const USERS_LIMIT = 25;

  const [carsPage, setCarsPage] = useState<number>(1);
  const [carsTotalPages, setCarsTotalPages] = useState<number>(1);
  const CARS_LIMIT = 25;

  // track which user card is expanded (only one at a time)
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  
  // view toggle: 'cards' or 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  // confirmation modal state – use `askConfirm` to request confirmation
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    message?: string;
    onConfirm?: () => Promise<void>;
  } | null>(null);
  const askConfirm = (message: string, onConfirm: () => Promise<void>) =>
    setConfirmState({ open: true, message, onConfirm });
  const runConfirm = async () => {
    if (!confirmState?.onConfirm) return setConfirmState(null);
    try {
      await confirmState.onConfirm();
    } catch (e) {
      console.error(e);
      showToast((e as any)?.message ?? "Action failed", "error");
    }
    setConfirmState(null);
  };

  /* ---------------------- data load ---------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        // Load stats first, then paginated lists
        const statsRes = await fetch("/api/admin/stats");
        setStats(await statsRes.json());

        // Load first page for users and cars
        await Promise.all([refreshUsers(1), refreshCars(1)]);
      } catch (e) {
        console.error(e);
        showToast("Failed to load admin data", "error");
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUsers = async (page: number = usersPage) => {
    try {
      const r = await fetch(`/api/admin/users?page=${page}&limit=${USERS_LIMIT}`);
      const json = await r.json();
      // API returns { data, meta }
      setUsers(json.data || []);
      setUsersPage(json.meta?.page ?? page);
      setUsersTotalPages(json.meta?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
      showToast("Failed to refresh users", "error");
    }
  };
  const refreshCars = async (page?: number) => {
    try {
      const p = page ?? carsPage;
      const r = await fetch(`/api/admin/cars?page=${p}&limit=${CARS_LIMIT}`);
      const json = await r.json();
      setCars(json.data || []);
      setCarsPage(json.meta?.page ?? p);
      setCarsTotalPages(json.meta?.totalPages ?? 1);
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
    // open a confirmation modal and perform the deletion when confirmed
    askConfirm("Delete this user?", async () => {
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
    });
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
    // Create a new car for a user. This function is intentionally small
    // and performs minimal validation — serverside validation still runs
    // in the API route. We return after refreshing cached lists so the
    // UI shows fresh data.
    try {
      const r = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        // The route returns JSON errors; prefer reading text so we
        // present something readable in toasts. Caller may also throw.
        const txt = await r.text();
        throw new Error(txt || `Failed to create car (${r.status})`);
      }

      // Refresh local caches after creation. This keeps the client
      // in sync without relying on optimistic updates.
      await refreshCars();
      await refreshUsers();
      showToast("Car added");
    } catch (e) {
      console.error("createCar error", e);
      showToast((e as any)?.message ?? "Failed to add car", "error");
      throw e;
    }
  };
  const deleteCar = async (id: string) => {
    // Delete a car by id. The route expects JSON { id } in the body.
    // We avoid silent failures and bubble errors so the caller can
    // inform the user appropriately.
    try {
      const r = await fetch("/api/admin/cars", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(txt || `Failed to delete car (${r.status})`);
      }
      await refreshCars();
      await refreshUsers();
      showToast("Car deleted");
    } catch (e) {
      console.error("deleteCar error", e);
      showToast((e as any)?.message ?? "Failed to delete car", "error");
      throw e;
    }
  };

  /* ---------------------- auth guard ---------------------- */
  if (!session?.user) {
    return <p className="p-8 text-gray-800">Loading session…</p>;
  }

  /* ---------------------- render ---------------------- */
  return (
    <main className="min-h-screen bg-[#0a0a0a] p-6 md:p-12 pt-32 md:pt-36 text-white">
      <div className="max-w-[1400px] mx-auto">
        {/* toast */}
        {toast && (
          <Toast
            message={toast.msg}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header (match user dashboard style) */}
        <div className="flex flex-wrap justify-between items-end mb-16 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
              Admin <span className="text-[#ff3366]">Control</span>
            </h1>
            <p className="text-[#999] uppercase tracking-widest text-sm">
              Manage platform users & stats
            </p>
          </div>

          <SignOutButton />
        </div>

        {/* KPI cards */}
        <section className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard label="Total Users" value={stats.userCount} />
          <StatCard label="Active Users" value={stats.activeUsers} />
          <StatCard label="Cars" value={stats.carCount} />
        </section>

      {/* Users list & actions */}
      <section className="space-y-4">
        <div className="bg-[#111] border border-white/5 p-6 rounded-xl flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-xl font-semibold text-white">Users</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="rounded bg-[#111] border border-white/5 px-3 py-1 text-sm font-medium text-white hover:opacity-90"
            >
              {viewMode === 'cards' ? '≡ Table' : '◆ Cards'}
            </button>
            <button
              onClick={() => {
                setShowCreate((s) => !s);
                setCreateForm({ name: "", email: "", role: "user" });
              }}
              className="rounded bg-[#111] border border-white/5 px-3 py-1 text-sm font-medium text-white hover:opacity-90"
            >
              {showCreate ? "Close" : "New User"}
            </button>
            <button
              onClick={() => {
                refreshUsers();
                refreshCars();
              }}
              className="rounded bg-[#111] border border-white/5 px-3 py-1 text-sm font-medium text-white hover:opacity-90"
            >
              Refresh
            </button>
          </div>
        </div>

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

        {/* Users as cards or table based on viewMode */}
        {viewMode === 'cards' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 md:p-6">
            {users.map((u) => {
              const uid = u.id ?? u._id!;
              // compute carCount by matching user id
              const carCount = cars.filter((c) => {
                const raw = c.userId ?? c.user ?? null;
                let id = raw;
                if (raw && typeof raw === "object") id = (raw as any)._id ?? (raw as any).id ?? raw;
                return String(id) === String(uid);
              }).length;

              return (
                <UserCard
                  key={String(uid)}
                  user={u}
                  cars={cars}
                  carCount={carCount}
                  onDeleteUser={deleteUser}
                  createCar={createCar}
                  deleteCar={deleteCar}
                  refreshUsers={refreshUsers}
                  isOpen={expandedUserId === String(uid)}
                  onToggle={() => setExpandedUserId(prev => prev === String(uid) ? null : String(uid))}
                  onRequestDeleteCar={(id:string) => askConfirm("Delete this car?", async () => await deleteCar(id))}
                  showToast={showToast}
                />
              );
            })}
          </div>
        ) : (
          <UserTable 
            users={users} 
            cars={cars} 
            onDeleteUser={deleteUser}
            createCar={createCar}
            deleteCar={deleteCar}
            refreshUsers={refreshUsers}
            expandedUserId={expandedUserId}
            onToggleExpand={(id) => setExpandedUserId(prev => prev === id ? null : id)}
            onRequestDeleteCar={(id:string) => askConfirm("Delete this car?", async () => await deleteCar(id))}
            showToast={showToast}
            askConfirm={askConfirm}
          />
        )}

        {/* Pagination controls for users (First / Prev / Page input / Next / Last) */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {usersPage} of {usersTotalPages}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => refreshUsers(1)}
              disabled={usersPage <= 1}
              className={`rounded px-3 py-1 text-sm font-medium ${usersPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
            >
              First
            </button>
            <button
              onClick={() => refreshUsers(Math.max(1, usersPage - 1))}
              disabled={usersPage <= 1}
              className={`rounded px-3 py-1 text-sm font-medium ${usersPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
            >
              Prev
            </button>

            <input
              type="number"
              min={1}
              max={usersTotalPages}
              value={usersPage}
              onChange={(e) => {
                const v = Math.max(1, Math.min(usersTotalPages, Number(e.target.value || 1)));
                setUsersPage(v);
                refreshUsers(v);
              }}
              className="w-20 rounded border border-gray-300 bg-white dark:bg-gray-900 p-1 text-sm text-gray-900 dark:text-gray-100"
            />

            <button
              onClick={() => refreshUsers(Math.min(usersTotalPages, usersPage + 1))}
              disabled={usersPage >= usersTotalPages}
              className={`rounded px-3 py-1 text-sm font-medium ${usersPage >= usersTotalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
            >
              Next
            </button>
            <button
              onClick={() => refreshUsers(usersTotalPages)}
              disabled={usersPage >= usersTotalPages}
              className={`rounded px-3 py-1 text-sm font-medium ${usersPage >= usersTotalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[var(--accent)] text-white hover:opacity-90'}`}
            >
              Last
            </button>
          </div>
        </div>
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
        showToast={showToast}
        askConfirm={askConfirm}
        carsPage={carsPage}
        carsTotalPages={carsTotalPages}
        setCarsPage={setCarsPage}
        refreshCars={refreshCars}
      />
      {/* Confirmation modal (centralized replacement for window.confirm) */}
      {confirmState?.open && (
        <Modal open={true} onClose={() => setConfirmState(null)} title="Confirm" size="sm" actions={
          <>
            <button onClick={() => setConfirmState(null)} className="px-3 py-1 rounded border">Cancel</button>
            <button onClick={async () => { await runConfirm(); }} className="px-3 py-1 rounded bg-red-600 text-white">Confirm</button>
          </>
        }>
          <div className="p-2">
            <p>{confirmState?.message}</p>
          </div>
        </Modal>
      )}
      </div>
    </main>
  );
}
