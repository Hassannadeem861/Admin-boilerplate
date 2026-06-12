import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getRecoveryQuestionsAsync,
  createRecoveryQuestionAsync,
  updateRecoveryQuestionAsync,
  deleteRecoveryQuestionAsync,
} from "../store/services/recoveryService";
import {
  resetCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
} from "../store/slices/recoverySlice";
import { asyncStatus } from "../utils/asyncStatus";
import "./RecoveryQuestion.css";
import { TableLoader } from "../components/Loading.jsx";
import { formatDate, UserToast } from "../utils/helperFunctions.jsx";
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
const RecoveryQuestion = () => {
  const dispatch = useDispatch();
  const {
    questions = [],
    get_status,
    create_status,
    create_error,
    update_status,
    update_error,
    delete_status,
    delete_error,
  } = useSelector((s) => s.recovery);

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

  // ── Fetch questions
  const fetchQuestions = useCallback(() => {
    dispatch(getRecoveryQuestionsAsync());
  }, [dispatch]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ── Toast helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, []);

  // ── Create success/error
  useEffect(() => {
    if (create_status === asyncStatus.SUCCEEDED) {
      showToast("Question created successfully");
      fetchQuestions();
      closeModal();
      dispatch(resetCreateStatus());
    }
    if (create_status === asyncStatus.ERROR && create_error) {
      showToast(create_error, "error");
      dispatch(resetCreateStatus());
    }
  }, [create_status, create_error, fetchQuestions, showToast, dispatch]);

  // ── Update success/error
  useEffect(() => {
    if (update_status === asyncStatus.SUCCEEDED) {
      showToast("Question updated successfully");
      fetchQuestions();
      closeModal();
      dispatch(resetUpdateStatus());
    }
    if (update_status === asyncStatus.ERROR && update_error) {
      showToast(update_error, "error");
      dispatch(resetUpdateStatus());
    }
  }, [update_status, update_error, fetchQuestions, showToast, dispatch]);

  // ── Delete success/error
  useEffect(() => {
    if (delete_status === asyncStatus.SUCCEEDED) {
      showToast("Question deleted successfully");
      setDeleteTarget(null);
      fetchQuestions();
      dispatch(resetDeleteStatus());
    }
    if (delete_status === asyncStatus.ERROR && delete_error) {
      showToast(delete_error, "error");
      dispatch(resetDeleteStatus());
    }
  }, [delete_status, delete_error, fetchQuestions, showToast, dispatch]);

  // ── Modal handlers
  const openAdd = () => {
    setEditTarget(null);
    setModal("add");
  };
  const openEdit = (question) => {
    setEditTarget(question);
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
  };

  // ── Submit handler
  const handleSubmit = (values) => {
    const payload = {
      question: values.question,
    };

    if (modal === "add") {
      dispatch(createRecoveryQuestionAsync(payload));
    } else {
      dispatch(updateRecoveryQuestionAsync({ id: editTarget._id, ...payload }));
    }
  };

  // ── Delete handler
  const handleDelete = () => {
    if (deleteTarget?._id) {
      dispatch(deleteRecoveryQuestionAsync(deleteTarget._id));
    }
  };

  // ── Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setCurrentPage(1);
  };

  // ── Filter questions based on search
  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const isLoading = get_status === asyncStatus.LOADING;
  const isSaving = create_status === asyncStatus.LOADING || update_status === asyncStatus.LOADING;
  const isDeleting = delete_status === asyncStatus.LOADING;

  // ── Pagination
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / pageSize) || 1;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalQuestions);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return Array.from(
        { length: maxVisiblePages },
        (_, idx) => totalPages - maxVisiblePages + idx + 1
      );
    }
    return Array.from({ length: maxVisiblePages }, (_, idx) => currentPage - 2 + idx);
  };

  // ── Initial values for form
  const getInitialValues = () => ({
    question: editTarget?.question || "",
  });

  return (
    <div className="rq-root">
      {/* PAGE HEADER */}
      <div className="rq-page-hd">
        <div>
          <h1 className="rq-page-title">Recovery Questions</h1>
          <p className="rq-page-sub">Manage security recovery questions for users</p>
        </div>
        <button className="rq-add-btn" onClick={openAdd}>
          <Plus size={15} strokeWidth={2} />
          Add Question
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="rq-bar">
        <div className="rq-search-wrap">
          <span className="rq-search-icon">
            <Search size={15} strokeWidth={1.8} />
          </span>
          <input
            className="rq-search"
            placeholder="Search questions…"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchInput && (
            <button type="button" className="rq-search-clear" onClick={handleClearSearch}>
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        {/* {debouncedSearch && (
          <span className="rq-search-badge">
            Searching: "{debouncedSearch}"
          </span>
        )} */}
      </div>

      {/* TABLE CARD */}
      <div className="rq-card">
        <table className="rq-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Question</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                  <TableLoader />
                </td>
              </tr>
            ) : paginatedQuestions.length === 0 ? (
              <tr>
                <td colSpan="4">
                  <div className="rq-empty">
                    <div className="rq-empty-icon">
                      <AlertCircle size={22} strokeWidth={1.5} />
                    </div>
                    <div className="rq-empty-title">No questions found</div>
                    <p className="rq-empty-sub">
                      {debouncedSearch
                        ? `No results found for "${debouncedSearch}"`
                        : "Click 'Add Question' to create one."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedQuestions.map((question, index) => (
                <tr key={question._id}>
                  <td data-label="#">{startRecord + index}</td>
                  <td data-label="Question">
                    <div className="rq-question-cell">
                      <div className="rq-question-text">{question.question}</div>
                    </div>
                  </td>
                  <td data-label="Created">
                    <span className="rq-date">{formatDate(question.createdAt)}</span>
                  </td>
                  <td data-label="Actions">
                    <div className="rq-actions">
                      <button
                        className="rq-action-btn edit"
                        title="Edit Question"
                        onClick={() => openEdit(question)}
                      >
                        <Pencil size={13} strokeWidth={2} />
                      </button>
                      <button
                        className="rq-action-btn del"
                        title="Delete Question"
                        onClick={() => setDeleteTarget(question)}
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
        {!isLoading && totalQuestions > 0 && (
          <div className="rq-tbl-foot">
            <span className="rq-count">
              Showing {startRecord}–{endRecord} of {totalQuestions} questions
            </span>

            <div className="rq-pagination">
              <button
                className="rq-pg-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} strokeWidth={2} />
              </button>

              {getPageNumbers().map((num) => (
                <button
                  key={num}
                  className={`rq-pg-btn ${currentPage === num ? "rq-pg-active" : ""}`}
                  onClick={() => setCurrentPage(num)}
                >
                  {num}
                </button>
              ))}

              <button
                className="rq-pg-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} strokeWidth={2} />
              </button>
            </div>

            <div className="rq-page-size">
              <span className="rq-page-size-label">Rows:</span>
              <select
                className="rq-page-size-select"
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
        <div className="rq-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="rq-modal">
            <div className="rq-modal-hd">
              <div>
                <div className="rq-modal-title">
                  {modal === "add" ? "Add New Question" : "Edit Question"}
                </div>
                <div className="rq-modal-sub">
                  {modal === "add"
                    ? "Create a new recovery question"
                    : `Editing: ${editTarget?.question?.substring(0, 50)}${editTarget?.question?.length > 50 ? '...' : ''}`}
                </div>
              </div>
              <button className="rq-modal-close" onClick={closeModal}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            <div className="rq-modal-body">
              <Formik
                initialValues={getInitialValues()}
                validationSchema={getValidationSchema("recovery_question")}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formSubmit }) => (
                  <div>
                    <div className="rq-field">
                      <label className="rq-label">
                        Question <span className="rq-req">*</span>
                      </label>
                      <textarea
                        name="question"
                        placeholder="Enter recovery question..."
                        rows="4"
                        className={`rq-textarea ${touched.question && errors.question ? "err" : ""}`}
                        value={values.question}
                        onChange={handleChange("question")}
                        onBlur={handleBlur("question")}
                        disabled={isSaving}
                      />
                      {touched.question && errors.question && (
                        <p className="rq-err-txt">
                          <AlertCircle size={12} strokeWidth={2} />
                          {errors.question}
                        </p>
                      )}
                    </div>

                    <div className="rq-modal-ft">
                      <button
                        type="button"
                        className="rq-btn-cancel"
                        onClick={closeModal}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rq-btn-submit"
                        onClick={formSubmit}
                        disabled={isSaving}
                      >
                        {isSaving && <span className="rq-spinner" />}
                        {isSaving
                          ? modal === "add"
                            ? "Creating…"
                            : "Saving…"
                          : modal === "add"
                          ? "Create Question"
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
          className="rq-overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="rq-confirm-modal">
            <div className="rq-confirm-icon">
              <AlertTriangle size={24} strokeWidth={1.8} />
            </div>
            <div className="rq-confirm-title">Delete Question?</div>
            <p className="rq-confirm-text">
              Are you sure you want to delete this question?
              <br />
              <span className="rq-confirm-name">"{deleteTarget.question}"</span>
              <br />
              This action cannot be undone.
            </p>
            <div className="rq-confirm-btns">
              <button
                className="rq-btn-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button className="rq-btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting && <span className="rq-spinner" />}
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

export default RecoveryQuestion;