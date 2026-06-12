
import React,{useCallback} from 'react'
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Users,
  UserCheck,
  UserX,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const getInitials = (name = "") =>
    name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "A";

export const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });
};

export const Toast = ({ message, type }) => (
  <div className={`am-toast ${type}`}>
    {type === "success"
      ? <CheckCircle size={16} strokeWidth={2} />
      : <AlertCircle size={16} strokeWidth={2} />
    }
    {message}
  </div>
);

export const UserToast = ({ message, type }) => (
  <div className={`um-toast ${type}`}>
    {type === "success"
      ? <CheckCircle size={16} strokeWidth={2} />
      : <AlertCircle  size={16} strokeWidth={2} />
    }
    {message}
  </div>
);

export const getAvatarBg = (name = '') => {
  const AV_BG = ['#0C1036', '#1a2460', '#243080', '#2e3d9a', '#394db0'];
  return AV_BG[(name.charCodeAt(0) || 0) % AV_BG.length];
};

/* ── Gradient helper for Chart.js ── */
export const makeGrad = (ctx, color1, color2) => {
  const g = ctx.createLinearGradient(0, 0, 0, 260);
  g.addColorStop(0, color1);
  g.addColorStop(1, color2);
  return g;
};

