// ...existing code...
"use client"; // <-- server component page using the client guard

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { UsersTable } from "./UserTable";
import { CarsTable } from "./CarsTable";
import { Stats } from "./Stats";
import { useRouter } from "next/navigation";

/**
 * Main admin dashboard page.
 * All data is loaded via the protected `/api/admin/*` endpoints.
 */
export function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  // local state
  const [stats, setStats] = useState({
    userCount: 0,
    activeUsers: 0,
    carCount: 0,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);

  // UI state for user CRUD
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Modal state for expanded user profile
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState<any | null>(null);
  const [modalForm, setModalForm] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [carForm, setCarForm] = useState({ make: "", model: "", color: "", licensePlate: "" });

  // load data when the component mounts
  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, usersRes, carsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/users"),
          fetch("/api/admin/cars"),
        ]);

        setStats(await statsRes.json());
        setUsers(await usersRes.json());
        setCars(await carsRes.json());
      } catch (err) {
        console.error("Failed loading admin data", err);
      }
    }
    loadData();
  }, []);

  // helper to refresh users from server
  async function refreshUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to refresh users", err);
    }
  }

  // helper to refresh cars
  async function refreshCars() {
    try {
      const res = await fetch("/api/admin/cars");
      const data = await res.json();
      setCars(data);
    } catch (err) {
      console.error("Failed to refresh cars", err);
    }
  }

  // Create user
  async function createUser(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await refreshUsers();
      setShowCreate(false);
      setForm({ name: "", email: "", role: "user" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  // Update user
  async function updateUser(e?: React.FormEvent) {
    e?.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      await refreshUsers();
      setEditingUser(null);
      setForm({ name: "", email: "", role: "user" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  // Delete user
  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      setUsers((u) => u.filter((x) => x.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  }

  // prepare form for edit
  function startEdit(user: any) {
    setEditingUser(user);
    setForm({ name: user.name || "", email: user.email || "", role: user.role || "user" });
    setShowCreate(false);
  }

  // Open modal with full user data
  function openModal(user: any) {
    setModalUser(user);
    // copy all editable fields into modalForm
    setModalForm({
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
    setCarForm({ make: "", model: "", color: "", licensePlate: "" });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalUser(null);
    setModalForm(null);
  }

  // Save modal changes to server
  async function saveModal(e?: React.FormEvent) {
    e?.preventDefault();
    if (!modalUser || !modalForm) return;
    setModalLoading(true);
    try {
      const id = modalUser.id ?? modalUser._id;
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalForm),
      });
      if (!res.ok) throw new Error(await res.text());
      await refreshUsers();
      await refreshCars();
      closeModal();
    } catch (err: any) {
      console.error("Failed to save user", err);
      setError(err.message || "Failed to save user");
    } finally {
      setModalLoading(false);
    }
  }

  // Add a car for the modal user
  async function addCar(e?: React.FormEvent) {
    e?.preventDefault();
    if (!modalUser) return;
    setModalLoading(true);
    try {
      const userId = modalUser.id ?? modalUser._id;
      const payload = { ...carForm, userId };
      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setCarForm({ make: "", model: "", color: "", licensePlate: "" });
      await refreshCars();
      await refreshUsers();
    } catch (err: any) {
      console.error("Failed to add car", err);
      setError(err.message || "Failed to add car");
    } finally {
      setModalLoading(false);
    }
  }

  // Delete a car
  async function deleteCar(carId: string) {
    if (!confirm("Delete this car?")) return;
    setModalLoading(true);
    try {
      const res = await fetch(`/api/admin/cars/${carId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      await refreshCars();
      await refreshUsers();
    } catch (err: any) {
      console.error("Failed to delete car", err);
      setError(err.message || "Failed to delete car");
    } finally {
      setModalLoading(false);
    }
  }

  // loading session status
  if (!session?.user) {
    return <p className="p-8 text-white">Loading session…</p>;
  }

  // site color: uses CSS variable --site-color with fallback
  const headerStyle = { background: "linear-gradient(90deg, var(--site-color, #0ea5a8), rgba(14,165,168,0.8))" };

  return (
    <div className="p-8 space-y-6 text-white">
      <header style={headerStyle} className="rounded-xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-sm opacity-90">Manage users, cars and view stats</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              signOut({ callbackUrl: "/" });
            }}
            className="px-4 py-2 bg-black/30 hover:bg-black/40 rounded-md text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* KPI cards */}
      <Stats {...stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users column */}
        <div className="bg-[#111] rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Users</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowCreate((s) => !s);
                  setEditingUser(null);
                  setForm({ name: "", email: "", role: "user" });
                }}
                className="px-3 py-1 rounded bg-white/8 hover:bg-white/12"
              >
                {showCreate ? "Close" : "New User"}
              </button>
            </div>
          </div>

          {error && <div className="text-red-400 mb-3">{error}</div>}

          {/* create / edit form */}
          {(showCreate || editingUser) && (
            <form onSubmit={editingUser ? updateUser : createUser} className="mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Name"
                  className="p-2 rounded bg-[#0d0d0d] border border-white/6"
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email"
                  className="p-2 rounded bg-[#0d0d0d] border border-white/6"
                />
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="p-2 rounded bg-[#0d0d0d] border border-white/6"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-white/10 hover:bg-white/16"
                >
                  {editingUser ? (loading ? "Saving..." : "Save") : loading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setEditingUser(null);
                    setForm({ name: "", email: "", role: "user" });
                  }}
                  className="px-4 py-2 rounded bg-white/6"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* users as cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.length === 0 && <div className="text-sm opacity-80">No users found</div>}

            {users.map((u) => {
              // find cars for this user (cars may have userId as string or populated object)
              const userCars = cars.filter((c: any) => {
                if (!c) return false;
                const uid = c.userId?._id ?? c.userId;
                // compare string representations
                try {
                  return String(uid) === String(u.id ?? u._id ?? u._id?.toString());
                } catch (e) {
                  return false;
                }
              });

              const addressParts = [u.address, u.city, u.zip].filter(Boolean);

              return (
                <div key={u.id ?? u._id} className="bg-[#0b0b0b] p-4 rounded-lg border border-white/6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-lg">{u.name || "—"}</div>
                        <div className="text-sm opacity-80">{u.email}</div>
                        <div className="text-xs ml-2 inline-block px-2 py-1 bg-white/6 rounded">{u.role}</div>
                      </div>

                      <div className="mt-2 text-sm space-y-1 opacity-85">
                        {addressParts.length > 0 && (
                          <div>
                            <strong>Address:</strong> {addressParts.join(", ")}
                          </div>
                        )}

                        {u.phone && (
                          <div>
                            <strong>Phone:</strong> {u.phone}
                          </div>
                        )}

                        {u.notes && (
                          <div className="max-w-prose">
                            <strong>Notes:</strong> {u.notes}
                          </div>
                        )}

                        {(u.preferredDay1 || u.preferredTime1) && (
                          <div>
                            <strong>Preferred:</strong> {u.preferredDay1 ?? ""} {u.preferredTime1 ?? ""}
                            {u.preferredDay2 || u.preferredTime2 ? ` — ${u.preferredDay2 ?? ""} ${u.preferredTime2 ?? ""}` : ""}
                          </div>
                        )}

                        <div>
                          <strong>Member:</strong> {u.membershipEnabled ? "Yes" : "No"}
                          {u.isSubscribed ? <span className="ml-2">• Subscribed</span> : null}
                        </div>

                        {u.stripeCustomerId && (
                          <div className="truncate">
                            <strong>Stripe ID:</strong> {u.stripeCustomerId}
                          </div>
                        )}
                      </div>

                      {/* Cars list */}
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Cars ({userCars.length})</div>
                        {userCars.length === 0 && <div className="text-xs opacity-70">No cars added</div>}
                        {userCars.map((car: any) => (
                          <div key={car._id ?? car.id} className="text-sm p-2 rounded bg-[#0d0d0d] border border-white/4 mb-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">{car.make} {car.model}</div>
                                <div className="text-xs opacity-80">{car.licensePlate}{car.color ? ` • ${car.color}` : ""}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs opacity-70">{car.isActive ? "Active" : "Inactive"}</div>
                                <button onClick={() => deleteCar(car._id ?? car.id)} className="text-xs px-2 py-1 rounded bg-red-600/80 hover:bg-red-600">Delete</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(u)}
                          className="px-2 py-1 text-sm rounded bg-white/8 hover:bg-white/12"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openModal(u)}
                          className="px-2 py-1 text-sm rounded bg-[var(--accent)] hover:opacity-90"
                          style={{ color: "white" }}
                        >
                          Expand
                        </button>
                        <button
                          onClick={() => deleteUser(u.id ?? u._id)}
                          className="px-2 py-1 text-sm rounded bg-red-600/80 hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>

                      <div className="text-xs opacity-70">{u.createdAt ? new Date(u.createdAt).toLocaleString() : null}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cars column (unchanged but included) */}
        <div className="bg-[#111] rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Cars</h2>
          <CarsTable cars={cars} />
        </div>
      </div>

      {/* Modal: expanded user profile */}
      {modalOpen && modalUser && modalForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={closeModal}></div>

          <form onSubmit={saveModal} className="relative z-10 w-full max-w-3xl bg-[#060606] rounded-lg shadow-xl overflow-auto" style={{ maxHeight: '90vh' }}>
            <header className="p-4 rounded-t" style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{modalForm.name || 'User'}</h3>
                  <div className="text-sm text-white/90">{modalForm.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={closeModal} className="px-3 py-1 rounded bg-white/10 text-white">Close</button>
                  <button type="submit" disabled={modalLoading} className="px-3 py-1 rounded bg-white text-black">{modalLoading ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </header>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
              <div className="space-y-3">
                <label className="block text-sm">Name
                  <input value={modalForm.name} onChange={(e) => setModalForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                </label>

                <label className="block text-sm">Email
                  <input type="email" value={modalForm.email} onChange={(e) => setModalForm((f: any) => ({ ...f, email: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                </label>

                <label className="block text-sm">Phone
                  <input value={modalForm.phone} onChange={(e) => setModalForm((f: any) => ({ ...f, phone: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                </label>

                <label className="block text-sm">Address
                  <input value={modalForm.address} onChange={(e) => setModalForm((f: any) => ({ ...f, address: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm">City
                    <input value={modalForm.city} onChange={(e) => setModalForm((f: any) => ({ ...f, city: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                  </label>
                  <label className="block text-sm">ZIP
                    <input value={modalForm.zip} onChange={(e) => setModalForm((f: any) => ({ ...f, zip: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                  </label>
                </div>

                <label className="block text-sm">Notes
                  <textarea value={modalForm.notes} onChange={(e) => setModalForm((f: any) => ({ ...f, notes: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                </label>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm">Preferred Day 1
                    <input value={modalForm.preferredDay1} onChange={(e) => setModalForm((f: any) => ({ ...f, preferredDay1: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                  </label>
                  <label className="block text-sm">Preferred Time 1
                    <input value={modalForm.preferredTime1} onChange={(e) => setModalForm((f: any) => ({ ...f, preferredTime1: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block text-sm">Preferred Day 2
                    <input value={modalForm.preferredDay2} onChange={(e) => setModalForm((f: any) => ({ ...f, preferredDay2: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                  </label>
                  <label className="block text-sm">Preferred Time 2
                    <input value={modalForm.preferredTime2} onChange={(e) => setModalForm((f: any) => ({ ...f, preferredTime2: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded" />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={modalForm.membershipEnabled} onChange={(e) => setModalForm((f: any) => ({ ...f, membershipEnabled: e.target.checked }))} /> Membership enabled</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={modalForm.isSubscribed} onChange={(e) => setModalForm((f: any) => ({ ...f, isSubscribed: e.target.checked }))} /> Subscribed</label>
                </div>

                <label className="block text-sm">Role
                  <select value={modalForm.role} onChange={(e) => setModalForm((f: any) => ({ ...f, role: e.target.value }))} className="w-full mt-1 p-2 bg-[#0d0d0d] rounded">
                    <option value="user">User</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <div className="mt-2">
                  <div className="text-sm font-medium mb-2">Manage Cars</div>

                  <div className="space-y-2">
                    {cars.filter((c: any) => String(c.userId?._id ?? c.userId) === String(modalUser.id ?? modalUser._id)).map((car: any) => (
                      <div key={car._id ?? car.id} className="flex items-center justify-between bg-[#0d0d0d] p-2 rounded">
                        <div className="text-sm">
                          <div className="font-semibold">{car.make} {car.model}</div>
                          <div className="text-xs opacity-80">{car.licensePlate}{car.color ? ` • ${car.color}` : ""}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => deleteCar(car._id ?? car.id)} className="px-2 py-1 rounded bg-red-600/80 text-xs">Delete</button>
                        </div>
                      </div>
                    ))}

                    <form onSubmit={addCar} className="grid grid-cols-2 gap-2">
                      <input placeholder="Make" value={carForm.make} onChange={(e) => setCarForm((f) => ({ ...f, make: e.target.value }))} className="p-2 bg-[#0d0d0d] rounded" />
                      <input placeholder="Model" value={carForm.model} onChange={(e) => setCarForm((f) => ({ ...f, model: e.target.value }))} className="p-2 bg-[#0d0d0d] rounded" />
                      <input placeholder="Color" value={carForm.color} onChange={(e) => setCarForm((f) => ({ ...f, color: e.target.value }))} className="p-2 bg-[#0d0d0d] rounded" />
                      <input placeholder="License" value={carForm.licensePlate} onChange={(e) => setCarForm((f) => ({ ...f, licensePlate: e.target.value }))} className="p-2 bg-[#0d0d0d] rounded" />
                      <div />
                      <button type="submit" className="px-3 py-2 rounded bg-[var(--accent)] text-white">Add Car</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
// ...existing code...