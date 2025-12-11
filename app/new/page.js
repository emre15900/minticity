"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import UserForm from "@/components/UserForm";
import { createUser } from "@/lib/api";
import { clearDeletedUserId, upsertCustomUser } from "@/lib/userStorage";

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (values) => {
    setLoading(true);
    setError("");
    try {
      const created = await createUser(values);
      const newUser = { ...values, id: created?.id || Date.now() };
      upsertCustomUser(newUser);
      clearDeletedUserId(newUser.id);
      router.push("/");
    } catch (err) {
      setError(err?.message || "Kullanıcı oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Yeni Kullanıcı
            </p>
            <h1 className="text-2xl font-bold text-slate-50">
              Kullanıcı Ekle
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-sky-400/60"
          >
            Listeye Dön
          </Link>
        </div>

        <UserForm
          initialValues={null}
          onSubmit={handleSubmit}
          submitLabel="Kullanıcı Oluştur"
          loading={loading}
        />

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}

