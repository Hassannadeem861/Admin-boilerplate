import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getUsersAsync,
  createUserAsync,
  updateUserAsync,
  deleteUserAsync,
} from "../store/services/userService";
import {
  resetCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
} from "../store/slices/userSlice";
import { asyncStatus } from "../utils/asyncStatus";
import "./Users.css";
import { TableLoader } from "../components/Loading.jsx";
import { formatDate, getInitials, UserToast } from "../utils/helperFunctions.jsx";
import { getValidationSchema } from "../utils/validationSchema.js";


// ─── DEBOUNCE HOOK ─────────────────────────────────────────────
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
const UserManagement = () => {
  const dispatch = useDispatch();
  const {
    users = [],
    pagination = {},
    get_status,
    create_status,
    create_error,
    update_status,
    update_error,
    delete_status,
    delete_error,
  } = useSelector((s) => s.user);

  // ── Local state
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // ── Fetch users with debounced search
  const fetchUsers = useCallback(() => {
    dispatch(getUsersAsync({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch
    }));
  }, [dispatch, currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // ── Toast helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, []);

  // ── Create success/error
  useEffect(() => {
    if (create_status === asyncStatus.SUCCEEDED) {
      showToast("User created successfully");
      fetchUsers();
      closeModal();
      dispatch(resetCreateStatus());
    }
    if (create_status === asyncStatus.ERROR && create_error) {
      showToast(create_error, "error");
      dispatch(resetCreateStatus());
    }
  }, [create_status, create_error, fetchUsers, showToast, dispatch]);

  // ── Update success/error
  useEffect(() => {
    if (update_status === asyncStatus.SUCCEEDED) {
      showToast("User updated successfully");
      fetchUsers();
      closeModal();
      dispatch(resetUpdateStatus());
    }
    if (update_status === asyncStatus.ERROR && update_error) {
      showToast(update_error, "error");
      dispatch(resetUpdateStatus());
    }
  }, [update_status, update_error, fetchUsers, showToast, dispatch]);

  // ── Delete success/error
  useEffect(() => {
    if (delete_status === asyncStatus.SUCCEEDED) {
      showToast("User deleted successfully");
      setDeleteTarget(null);
      fetchUsers();
      dispatch(resetDeleteStatus());
    }
    if (delete_status === asyncStatus.ERROR && delete_error) {
      showToast(delete_error, "error");
      dispatch(resetDeleteStatus());
    }
  }, [delete_status, delete_error, fetchUsers, showToast, dispatch]);

  // ── Modal handlers
  const openAdd = () => {
    setEditTarget(null);
    setModal("add");
  };
  const openEdit = (user) => {
    setEditTarget(user);
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
  };

  // ── Submit handler
  const handleSubmit = (values) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      age: parseInt(values.age, 10),
    };

    if (modal === "add") {
      dispatch(createUserAsync(payload));
    } else {
      dispatch(updateUserAsync({ id: editTarget._id, ...payload }));
    }
  };

  // ── Delete handler
  const handleDelete = () => {
    if (deleteTarget?._id) {
      dispatch(deleteUserAsync(deleteTarget._id));
    }
  };

  // ── Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  const getUserFullName = (user) => {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "—";
  };

  const isLoading = get_status === asyncStatus.LOADING;
  const isSaving = create_status === asyncStatus.LOADING || update_status === asyncStatus.LOADING;
  const isDeleting = delete_status === asyncStatus.LOADING;

  // ── Pagination (using API pagination)
  const totalUsers = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const currentPageFromAPI = pagination?.page || currentPage;

  const startRecord = ((currentPageFromAPI - 1) * pageSize) + 1;
  const endRecord = Math.min(currentPageFromAPI * pageSize, totalUsers);

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    if (currentPageFromAPI <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPageFromAPI >= totalPages - 2) {
      return Array.from(
        { length: maxVisiblePages },
        (_, idx) => totalPages - maxVisiblePages + idx + 1
      );
    }
    return Array.from(
      { length: maxVisiblePages },
      (_, idx) => currentPageFromAPI - 2 + idx
    );
  };

  // ── Initial values for form
  const getInitialValues = () => ({
    firstName: editTarget?.firstName || "",
    lastName: editTarget?.lastName || "",
    email: editTarget?.email || "",
    phoneNumber: editTarget?.phoneNumber || "",
    age: editTarget?.age || "",
  });

  return (
    <div className="um-root">
      {/* PAGE HEADER */}
      <div className="um-page-hd">
        <div>
          <h1 className="um-page-title">User Management</h1>
          <p className="um-page-sub">Create and manage user accounts</p>
        </div>
        <button className="um-add-btn" onClick={openAdd}>
          <UserPlus size={15} strokeWidth={2} />
          Add User
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="um-bar">
        <div className="um-search-wrap">
          <span className="um-search-icon">
            <Search size={15} strokeWidth={1.8} />
          </span>
          <input
            className="um-search"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              className="um-search-clear"
              onClick={handleClearSearch}
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        {debouncedSearch && (
          <span className="um-search-badge">
            Searching: "{debouncedSearch}"
          </span>
        )}
      </div>

      {/* TABLE CARD */}
      <div className="um-card">
        <table className="um-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Verified</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                  <TableLoader />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="um-empty">
                    <div className="um-empty-icon">
                      <Users size={22} strokeWidth={1.5} />
                    </div>
                    <div className="um-empty-title">No users found</div>
                    <p className="um-empty-sub">
                      {debouncedSearch
                        ? `No results found for "${debouncedSearch}"`
                        : "Click 'Add User' to create one."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td data-label="User">
                    <div className="um-user-cell">
                      <div className="um-avatar">{getInitials(getUserFullName(user))}</div>
                      <div>
                        <div className="um-name">{getUserFullName(user)}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Email">
                    <span className="um-email">{user.email}</span>
                  </td>
                  <td data-label="Phone">{user.phoneNumber || "—"}</td>
                  <td data-label="Age">{user.age || "—"}</td>
                  <td data-label="Verified">
                    <span>
                      {user.isVerified ? "✓ Email" : "✗ Email"}
                      {user.isPhoneVerified && " • ✓ Phone"}
                    </span>
                  </td>
                  <td data-label="Created">
                    <span className="um-date">{formatDate(user.createdAt)}</span>
                  </td>
                  <td data-label="Actions">
                    <div className="um-actions">
                      <button
                        className="um-action-btn edit"
                        title="Edit User"
                        onClick={() => openEdit(user)}
                      >
                        <Pencil size={13} strokeWidth={2} />
                      </button>
                      <button
                        className="um-action-btn del"
                        title="Delete User"
                        onClick={() => setDeleteTarget(user)}
                      >
                        <Trash2 size={13} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION FOOTER */}
        {!isLoading && totalUsers > 0 && (
          <div className="um-tbl-foot">
            <span className="um-count">
              Showing {startRecord}–{endRecord} of {totalUsers} users
            </span>

            <div className="um-pagination">
              <button
                className="um-pg-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPageFromAPI === 1}
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>

              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  className={`um-pg-btn ${currentPageFromAPI === num ? "um-pg-active" : ""}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="um-pg-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPageFromAPI === totalPages}
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div className="um-page-size">
              <span className="um-page-size-label">Rows:</span>
              <select
                className="um-page-size-select"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {modal && (
        <div
          className="um-overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="um-modal">
            <div className="um-modal-hd">
              <div>
                <div className="um-modal-title">
                  {modal === "add" ? "Add New User" : "Edit User"}
                </div>
                <div className="um-modal-sub">
                  {modal === "add"
                    ? "Create a new user account"
                    : `Editing: ${getUserFullName(editTarget)}`}
                </div>
              </div>
              <button className="um-modal-close" onClick={closeModal}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="um-modal-body">
              <Formik
                initialValues={getInitialValues()}
                validationSchema={getValidationSchema("userManagement")}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formSubmit }) => (
                  <div>
                    <div className="um-field">
                      <label className="um-label">
                        First Name <span className="um-req">*</span>
                      </label>
                      <input
                        name="firstName"
                        type="text"
                        placeholder="Enter first name"
                        className={`um-input ${touched.firstName && errors.firstName ? "err" : ""}`}
                        value={values.firstName}
                        onChange={handleChange("firstName")}
                        onBlur={handleBlur("firstName")}
                        disabled={isSaving}
                      />
                      {touched.firstName && errors.firstName && (
                        <p className="um-err-txt">
                          <AlertCircle size={12} strokeWidth={2} />
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    <div className="um-field">
                      <label className="um-label">
                        Last Name <span className="um-req">*</span>
                      </label>
                      <input
                        name="lastName"
                        type="text"
                        placeholder="Enter last name"
                        className={`um-input ${touched.lastName && errors.lastName ? "err" : ""}`}
                        value={values.lastName}
                        onChange={handleChange("lastName")}
                        onBlur={handleBlur("lastName")}
                        disabled={isSaving}
                      />
                      {touched.lastName && errors.lastName && (
                        <p className="um-err-txt">
                          <AlertCircle size={12} strokeWidth={2} />
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    <div className="um-field">
                      <label className="um-label">
                        Email Address <span className="um-req">*</span>
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="user@example.com"
                        className={`um-input ${touched.email && errors.email ? "err" : ""}`}
                        value={values.email}
                        onChange={handleChange("email")}
                        onBlur={handleBlur("email")}
                        disabled={isSaving}
                      />
                      {touched.email && errors.email && (
                        <p className="um-err-txt">
                          <AlertCircle size={12} strokeWidth={2} />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="um-field">
                      <label className="um-label">
                        Phone Number <span className="um-req">*</span>
                      </label>
                      <input
                        name="phoneNumber"
                        type="tel"
                        placeholder="Enter phone number"
                        className={`um-input ${touched.phoneNumber && errors.phoneNumber ? "err" : ""}`}
                        value={values.phoneNumber}
                        onChange={handleChange("phoneNumber")}
                        onBlur={handleBlur("phoneNumber")}
                        disabled={isSaving}
                      />
                      {touched.phoneNumber && errors.phoneNumber && (
                        <p className="um-err-txt">
                          <AlertCircle size={12} strokeWidth={2} />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div className="um-field">
                      <label className="um-label">
                        Age <span className="um-req">*</span>
                      </label>
                      <input
                        name="age"
                        type="number"
                        placeholder="Enter age"
                        className={`um-input ${touched.age && errors.age ? "err" : ""}`}
                        value={values.age}
                        onChange={handleChange("age")}
                        onBlur={handleBlur("age")}
                        disabled={isSaving}
                      />
                      {touched.age && errors.age && (
                        <p className="um-err-txt">
                          <AlertCircle size={12} strokeWidth={2} />
                          {errors.age}
                        </p>
                      )}
                    </div>

                    <div className="um-modal-ft" style={{ marginTop: 20 }}>
                      <button
                        type="button"
                        className="um-btn-cancel"
                        onClick={closeModal}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="um-btn-submit"
                        onClick={formSubmit}
                        disabled={isSaving}
                      >
                        {isSaving && <span className="um-spinner" />}
                        {isSaving
                          ? modal === "add"
                            ? "Creating…"
                            : "Saving…"
                          : modal === "add"
                            ? "Create User"
                            : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </Formik>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div
          className="um-overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="um-confirm-modal">
            <div className="um-confirm-icon">
              <AlertTriangle size={24} strokeWidth={1.8} />
            </div>
            <div className="um-confirm-title">Delete User?</div>
            <p className="um-confirm-text">
              Are you sure you want to delete{" "}
              <span className="um-confirm-name">{getUserFullName(deleteTarget)}</span>?
              This action cannot be undone.
            </p>
            <div className="um-confirm-btns">
              <button
                className="um-btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button className="um-btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <span className="um-spinner" />}
                {isDeleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <UserToast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UserManagement;