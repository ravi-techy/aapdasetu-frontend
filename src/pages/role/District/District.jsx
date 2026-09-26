
import React, { useState, useEffect, useCallback } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listDistricts,
} from "../../../services";
import {
  MapPin,
  Plus,
  X,
  RefreshCw,
  Trash2,
  Pencil,
  Check,
} from "lucide-react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  linked_id: "",
};

function District() {
  const [users, setUsers] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Inline edit state
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    linked_id: "",
  });

  /* --------------------------------
     Load district users
  -------------------------------- */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await listUsers({
        role: "district",
        page: 1,
        per_page: 50,
      });

      setUsers(res?.data?.users ?? res?.data ?? []);
    } catch (err) {
      setError(
        err.message || "Failed to load district users",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* --------------------------------
     Load districts
  -------------------------------- */
  const fetchDistricts = useCallback(async () => {
    setDistrictsLoading(true);

    try {
      const res = await listDistricts();

      setDistricts(res?.data ?? []);
    } catch (err) {
      setError(
        err.message || "Failed to load districts",
      );
    } finally {
      setDistrictsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDistricts();
  }, [fetchUsers, fetchDistricts]);

  /* --------------------------------
     Form handling
  -------------------------------- */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setShowForm(false);
  };

  /* --------------------------------
     Create District User
  -------------------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Required field validation
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.linked_id ||
      !form.password
    ) {
      setError(
        "Name, Email, Phone, District and Password are required.",
      );
      return;
    }

    // Frontend-only password confirmation
    if (!form.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(
        "Password and Confirm Password do not match.",
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
       * confirmPassword is intentionally NOT included.
       * It is used only for frontend validation.
       */
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: "district",
        linked_id: Number(form.linked_id),
      };

      const res = await createUser(payload);

      setUsers((prev) => [
        res.data,
        ...prev,
      ]);

      setSuccess(
        `District user "${
          res.data?.name || form.name
        }" created successfully.`,
      );

      resetForm();
    } catch (err) {
      setError(
        err.message || "Failed to create user",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------
     Start inline edit
  -------------------------------- */
  const startEdit = (user) => {
    setEditId(user.id);

    setEditData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      linked_id:
        user.linked_id ||
        user.districtId ||
        user.district?.id ||
        "",
    });

    setError("");
    setSuccess("");
  };

  /* --------------------------------
     Update District User
  -------------------------------- */
  const handleUpdate = async (id) => {
    if (
      !editData.name.trim() ||
      !editData.email.trim() ||
      !editData.phone.trim() ||
      !editData.linked_id
    ) {
      setError(
        "Name, Email, Phone and District are required.",
      );
      return;
    }

    setError("");
    setSuccess("");

    try {
      const payload = {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim(),
        role: "district",
        linked_id: Number(editData.linked_id),
        status: "active",
      };

      const res = await updateUser(id, payload);

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? { ...user, ...res.data }
            : user,
        ),
      );

      setEditId(null);

      setSuccess("District user updated successfully.");
    } catch (err) {
      setError(
        err.message || "Failed to update user",
      );
    }
  };

  /* --------------------------------
     Delete user
  -------------------------------- */
  const handleDelete = async (id, name) => {
    if (
      !window.confirm(
        `Delete district user "${name}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(id);

      setUsers((prev) =>
        prev.filter((user) => user.id !== id),
      );

      setSuccess(
        `District user "${name}" deleted successfully.`,
      );
    } catch (err) {
      setError(
        err.message || "Failed to delete user",
      );
    }
  };

  /* --------------------------------
     Get district name
  -------------------------------- */
  const getDistrictName = (user) => {
    if (user.district?.name) {
      return user.district.name;
    }

    if (user.district_name) {
      return user.district_name;
    }

    if (user.districtName) {
      return user.districtName;
    }

    const districtId =
      user.linked_id ||
      user.districtId;

    const district = districts.find(
      (item) =>
        String(item.id) === String(districtId),
    );

    return district?.name || "—";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MapPin
              className="text-purple-600"
              size={28}
            />

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                District Users
              </h1>

              <p className="text-sm text-slate-500">
                Manage district-level authority accounts
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setSuccess("");

                if (!showForm) {
                  setForm({ ...EMPTY_FORM });
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
            >
              {showForm ? (
                <>
                  <X size={15} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Add District User
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Create Form */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showForm
              ? "mb-6 grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Add District User
              </h2>

              <form onSubmit={handleCreate}>
                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Full Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Full Name *
                    </label>

                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Email *
                    </label>

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Phone *
                    </label>

                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876512456"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      District *
                    </label>

                    <select
                      name="linked_id"
                      value={form.linked_id}
                      onChange={handleChange}
                      disabled={districtsLoading}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {districtsLoading
                          ? "Loading districts..."
                          : "Select District"}
                      </option>

                      {districts.map((district) => (
                        <option
                          key={district.id}
                          value={district.id}
                        >
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Password *
                    </label>

                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Set a password"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Confirm Password *
                    </label>

                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      districtsLoading
                    }
                    className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Creating…"
                      : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              District Users{" "}
              {!loading && (
                <span className="ml-1 text-sm font-normal text-slate-500">
                  ({users.length})
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Loading…
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MapPin
                size={36}
                className="mb-2 text-slate-200"
              />

              <p className="text-sm text-slate-500">
                No district users yet. Add one above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">
                      Name
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Email
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Phone
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      District
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-slate-50"
                    >

                      {/* Name */}
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {editId === u.id ? (
                          <input
                            value={editData.name}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-36 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-purple-400"
                          />
                        ) : (
                          u.name
                        )}
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 text-slate-600">
                        {editId === u.id ? (
                          <input
                            value={editData.email}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            className="w-44 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-purple-400"
                          />
                        ) : (
                          u.email
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3 text-slate-500">
                        {editId === u.id ? (
                          <input
                            value={editData.phone}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                              }))
                            }
                            className="w-32 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-purple-400"
                          />
                        ) : (
                          u.phone || "—"
                        )}
                      </td>

                      {/* District */}
                      <td className="px-5 py-3 text-slate-600">
                        {editId === u.id ? (
                          <select
                            value={editData.linked_id}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                linked_id:
                                  e.target.value,
                              }))
                            }
                            className="w-44 rounded border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-purple-400"
                          >
                            <option value="">
                              Select District
                            </option>

                            {districts.map(
                              (district) => (
                                <option
                                  key={district.id}
                                  value={district.id}
                                >
                                  {district.name}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          getDistrictName(u)
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            u.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {u.status || "active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3">
                        <div className="flex gap-1">

                          {editId === u.id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdate(u.id)
                                }
                                className="rounded p-1.5 text-green-600 transition-colors hover:bg-green-50"
                                title="Save"
                              >
                                <Check size={14} />
                              </button>

                              <button
                                onClick={() =>
                                  setEditId(null)
                                }
                                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  startEdit(u)
                                }
                                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(
                                    u.id,
                                    u.name,
                                  )
                                }
                                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default District;
