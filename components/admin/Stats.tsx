// components/admin/Stats.tsx
import React from "react";

export function Stats({
  userCount,
  activeUsers,
  carCount,
}: {
  userCount: number;
  activeUsers: number;
  carCount: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="p-5 rounded-xl shadow-md bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider opacity-90">Total Users</div>
            <div className="text-3xl font-extrabold mt-1">{userCount}</div>
          </div>
          <div className="text-3xl">👥</div>
        </div>
      </div>

      <div className="p-5 rounded-xl shadow-md bg-[#111] border border-white/6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#999]">Active Users (30 days)</div>
            <div className="text-3xl font-extrabold mt-1">{activeUsers}</div>
          </div>
          <div className="text-3xl">🟢</div>
        </div>
      </div>

      <div className="p-5 rounded-xl shadow-md bg-[#111] border border-white/6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#999]">Total Cars</div>
            <div className="text-3xl font-extrabold mt-1">{carCount}</div>
          </div>
          <div className="text-3xl">🚗</div>
        </div>
      </div>
    </div>
  );
}