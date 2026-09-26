
import React, { useState, useEffect, useCallback } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../../services";
import { UserCog, Plus, X, RefreshCw, Trash2, Pencil } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const getUserRole = (user) => {
  if (user.role || user.user_role || user.user_type) {
    return user.role || user.user_role || user.user_type;
  }

  if (user.volunteer_id || user.volunteerId || user.volunteer) {
    return "volunteer";
  }

  if (user.agency_id || user.agencyId || user.agency) {
    return "NGO";
  }

  return "";
};

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUserId, setEditingUserId] = useState(null);
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 20,
    current_page: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await listUsers({
        role: "admin",
        page,
        per_page: 20,
      });

      setUsers(res?.data?.users ?? res?.data ?? []);

      setPagination(
        res?.data?.pagination ?? {
          total: 0,
          per_page: 20,
          current_page: page,
          total_pages: 1,
          has_next: false,
          has_prev: false,
        },
      );
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingUserId(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      confirmPassword: "",
    });

    setEditingUserId(user.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      (!editingUserId && !form.password)
    ) {
      setError(
        `Name, Email, Phone${
          editingUserId ? "" : " and Password"
        } are required.`,
      );
      return;
    }

    // Frontend-only password confirmation.
    // confirmPassword is NEVER sent to the backend.
    if (form.password) {
      if (!form.confirmPassword) {
        setError("Please confirm your password.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Password and Confirm Password do not match.");
        return;
      }
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Only API fields go into this payload.
      // confirmPassword is intentionally excluded.
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: "admin",
      };

      // Send password only when user entered one.
      if (form.password) {
        payload.password = form.password;
      }

      if (editingUserId) {
        // Update existing user
        const res = await updateUser(editingUserId, payload);

        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingUserId
              ? { ...user, ...res.data }
              : user,
          ),
        );

        setSuccess(
          `User "${res.data?.name || form.name}" updated successfully.`,
        );
      } else {
        // Create new user
        // confirmPassword is NOT included.
        const res = await createUser(payload);

        setUsers((prev) => [res.data, ...prev]);

        setSuccess(
          `User "${res.data?.name || form.name}" created successfully.`,
        );
      }

      resetForm();
    } catch (err) {
      setError(
        err.message ||
          `Failed to ${
            editingUserId ? "update" : "create"
          } user`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return;

    try {
      await deleteUser(id);

      setUsers((prev) =>
        prev.filter((user) => user.id !== id),
      );

      setSuccess(`User "${name}" deleted successfully.`);
    } catch (err) {
      setError(err.message || "Failed to delete user");
    }
  };

  const systemUsers = users.filter(
    (user) =>
      getUserRole(user).toLowerCase() === "admin",
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <UserCog
              className="text-green-600"
              size={28}
            />

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                User Management
              </h1>

              <p className="text-sm text-slate-500">
                Create and manage system users
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
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setError("");
                setSuccess("");
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              {showForm ? (
                <>
                  <X size={15} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Add User
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

        {/* Create / Edit Form */}
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showForm
              ? "mb-6 grid-rows-[1fr] opacity-100"
              : "pointer-events-none grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="mb-5 text-lg font-semibold text-slate-900">
                {editingUserId
                  ? "Edit User"
                  : "Create New User"}
              </h2>

              <form onSubmit={handleSubmit}>
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
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Password
                      {editingUserId ? "" : " *"}
                    </label>

                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder={
                        editingUserId
                          ? "Leave blank to keep current"
                          : "Set a password"
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>

                  {/* Confirm Password - FRONTEND ONLY */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Confirm Password
                      {editingUserId ? "" : " *"}
                    </label>

                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder={
                        editingUserId
                          ? "Confirm new password"
                          : "Re-enter password"
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
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
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? editingUserId
                        ? "Updating…"
                        : "Creating…"
                      : editingUserId
                        ? "Update User"
                        : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              Admin Users{" "}
              {!loading && (
                <span className="ml-1 text-sm font-normal text-slate-500">
                  ({systemUsers.length})
                </span>
              )}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-sm text-slate-500">
              Loading users…
            </div>
          ) : systemUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <UserCog
                size={40}
                className="mb-3 text-slate-300"
              />

              <p className="font-medium text-slate-700">
                No users found
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
                      Status
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {systemUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {user.name}
                      </td>

                      <td className="px-5 py-3 text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-5 py-3 text-slate-500">
                        {user.phone || "—"}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {user.status || "active"}
                        </span>
                      </td>

                      <td className="flex items-center gap-1 px-5 py-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              user.id,
                              user.name,
                            )
                          }
                          className="rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.total_pages > 1 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {(pagination.current_page - 1) *
                  pagination.per_page +
                  1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {Math.min(
                  pagination.current_page *
                    pagination.per_page,
                  pagination.total,
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {pagination.total}
              </span>{" "}
              users
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.has_prev}
                onClick={() =>
                  setPage((prev) =>
                    Math.max(1, prev - 1),
                  )
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                Page {pagination.current_page} of{" "}
                {pagination.total_pages}
              </span>

              <button
                type="button"
                disabled={!pagination.has_next}
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
