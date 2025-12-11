"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteUser, fetchUsers } from "@/lib/api";
import {
  addDeletedUserId,
  getCustomUsers,
  getDeletedUserIds,
  removeCustomUser,
} from "@/lib/userStorage";

const PAGE_SIZE = 5;

const matchesFilter = (user, filter) => {
  if (!filter) return true;
  const value = filter.toLowerCase();
  return (
    user.name?.toLowerCase().includes(value) ||
    user.username?.toLowerCase().includes(value) ||
    user.email?.toLowerCase().includes(value) ||
    user.phone?.toLowerCase().includes(value) ||
    user.company?.name?.toLowerCase().includes(value)
  );
};

const mergeUsers = (apiUsers, customUsers, deletedIds) => {
  const deletedSet = new Set(deletedIds.map((id) => Number(id)));
  const customMap = new Map(
    customUsers.map((user) => [Number(user.id), user])
  );

  const merged = apiUsers
    .filter((user) => !deletedSet.has(Number(user.id)))
    .map((user) => customMap.get(Number(user.id)) || user);

  const remainingCustom = customUsers
    .filter(
      (user) =>
        !merged.some((mergedUser) => Number(mergedUser.id) === Number(user.id)) &&
        !deletedSet.has(Number(user.id))
    )
    .sort(
      (a, b) =>
        Number(b.createdAt || 0) - Number(a.createdAt || 0) ||
        Number(b.id) - Number(a.id)
    );

  return [...remainingCustom, ...merged];
};

export default function UserListClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUsers = await fetchUsers();
      const customUsers = getCustomUsers();
      const deletedIds = getDeletedUserIds();
      setUsers(mergeUsers(apiUsers, customUsers, deletedIds));
    } catch (err) {
      setError(err?.message || "Kullanıcı listesi alınırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteUser(id);
      addDeletedUserId(id);
      removeCustomUser(id);
      setUsers((prev) =>
        prev.filter((user) => Number(user.id) !== Number(id))
      );
    } catch (err) {
      setError(err?.message || "Kullanıcı silinirken hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(
    () => users.filter((user) => matchesFilter(user, filter)),
    [users, filter]
  );

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const paginatedUsers = filteredUsers.slice(offset, offset + PAGE_SIZE);

  const hasNoData = !loading && paginatedUsers.length === 0;

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-2xl shadow-sky-500/10 backdrop-blur">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Kullanıcı Yönetimi
          </p>
          <h1 className="text-2xl font-bold text-slate-50">
            Mini User Dashboard
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Ara: isim, email, şirket..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 shadow-inner shadow-slate-950/40 transition focus:border-sky-400 focus:outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">
              {filteredUsers.length}
            </span>
          </div>
          <Link
            href="/new"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400"
          >
            Yeni Kullanıcı Ekle
          </Link>
        </div>
      </header>

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p>{error}</p>
          <button
            type="button"
            onClick={loadUsers}
            className="rounded-lg border border-red-300/40 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-800/80">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/70">
              <tr className="text-left text-slate-300">
                <th className="px-4 py-3">İsim</th>
                <th className="px-4 py-3">Kullanıcı Adı</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Şirket</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <SkeletonRows />
              ) : hasNoData ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-slate-400"
                  >
                    Kriterlere uyan kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3 font-medium text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        {Number(user.id) >= 1000 ? (
                          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-sky-200">
                            Yeni
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      @{user.username}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{user.email}</td>
                    <td className="px-4 py-3 text-slate-300">{user.phone}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {user.company?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/users/${user.id}`}
                          className="rounded-lg border border-sky-400/60 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-500/15"
                        >
                          Detay
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="rounded-lg border border-red-400/60 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === user.id ? "Siliniyor..." : "Sil"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Toplam {filteredUsers.length} kullanıcı
        </p>
        <Pagination
          page={currentPage}
          pageCount={pageCount}
          onPageChange={setPage}
        />
      </footer>
    </section>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-3.5 w-40 rounded bg-slate-800" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3.5 w-28 rounded bg-slate-800" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3.5 w-48 rounded bg-slate-800" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3.5 w-32 rounded bg-slate-800" />
          </td>
          <td className="px-4 py-3">
            <div className="h-3.5 w-32 rounded bg-slate-800" />
          </td>
          <td className="px-4 py-3">
            <div className="ml-auto h-3.5 w-20 rounded bg-slate-800" />
          </td>
        </tr>
      ))}
    </>
  );
}

function Pagination({ page, pageCount, onPageChange }) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="flex items-center gap-3 text-sm text-slate-200">
      <button
        type="button"
        onClick={() => canPrev && onPageChange(page - 1)}
        disabled={!canPrev}
        className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold transition hover:border-sky-400/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Önceki
      </button>
      <span className="text-xs text-slate-400">
        Sayfa {page} / {pageCount}
      </span>
      <button
        type="button"
        onClick={() => canNext && onPageChange(page + 1)}
        disabled={!canNext}
        className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold transition hover:border-sky-400/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Sonraki
      </button>
    </div>
  );
}

