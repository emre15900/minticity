"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserForm from "@/components/UserForm";
import { deleteUser, fetchUserById, updateUser } from "@/lib/api";
import {
  addDeletedUserId,
  findLocalUserById,
  removeCustomUser,
  upsertCustomUser,
} from "@/lib/userStorage";

export default function UserDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");
      const localUser = findLocalUserById(id);
      if (localUser) {
        setUser(localUser);
        setLoading(false);
        return;
      }

      try {
        const remoteUser = await fetchUserById(id);
        setUser(remoteUser);
      } catch (err) {
        setError(err?.message || "Kullanıcı bulunamadı");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleSubmit = async (values) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateUser(id, values);
      const updatedUser = { ...values, id: Number(id) };
      upsertCustomUser(updatedUser);
      setUser(updatedUser);
      setSuccess("Kullanıcı başarıyla güncellendi");
    } catch (err) {
      setError(err?.message || "Güncelleme sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteUser(id);
      addDeletedUserId(Number(id));
      removeCustomUser(Number(id));
      router.push("/");
    } catch (err) {
      setError(err?.message || "Kullanıcı silinemedi");
    } finally {
      setDeleting(false);
    }
  };

  const showForm = !loading && user;

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Kullanıcı Detayı
            </p>
            <h1 className="text-2xl font-bold text-slate-50">
              #{id} Kullanıcı Bilgisi
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-sky-400/60"
          >
            Listeye Dön
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-800" />
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded bg-slate-800" />
              ))}
            </div>
          </div>
        ) : null}

        {error && !showForm ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {showForm ? (
          <>
            <UserForm
              initialValues={user}
              onSubmit={handleSubmit}
              submitLabel="Kullanıcıyı Güncelle"
              loading={saving}
              onDelete={handleDelete}
              deleteLoading={deleting}
            />
            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {success}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}

