"use client";

import { useEffect, useState } from "react";

const defaultValues = {
  name: "",
  username: "",
  email: "",
  phone: "",
  website: "",
  companyName: "",
};

const buildValues = (incoming) => ({
  ...defaultValues,
  ...incoming,
  companyName: incoming?.company?.name || incoming?.companyName || "",
});

export default function UserForm({
  initialValues,
  onSubmit,
  onDelete,
  submitLabel = "Kaydet",
  deleteLabel = "Sil",
  loading = false,
  deleteLoading = false,
}) {
  const [values, setValues] = useState(buildValues(initialValues));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setValues(buildValues(initialValues));
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = "İsim zorunlu";
    if (!values.username.trim()) nextErrors.username = "Kullanıcı adı zorunlu";
    if (!values.email.trim()) nextErrors.email = "Email zorunlu";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        website: values.website.trim(),
        company: { name: values.companyName.trim() },
      });
    } catch (error) {
      setFormError(error?.message || "Bir hata oluştu");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-sky-500/10 backdrop-blur"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="İsim"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Örn: Leanne Graham"
        />
        <TextField
          label="Kullanıcı Adı"
          name="username"
          value={values.username}
          onChange={handleChange}
          error={errors.username}
          placeholder="Örn: Bret"
        />
        <TextField
          label="Email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ornek@minticity.com"
        />
        <TextField
          label="Telefon"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          placeholder="+90 555 555 55 55"
        />
        <TextField
          label="Web Sitesi"
          name="website"
          value={values.website}
          onChange={handleChange}
          placeholder="minticity.com"
        />
        <TextField
          label="Şirket"
          name="companyName"
          value={values.companyName}
          onChange={handleChange}
          placeholder="Minticity"
        />
      </div>

      {formError ? (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {formError}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-500/40 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Kaydediliyor..." : submitLabel}
        </button>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleteLoading}
            className="inline-flex items-center justify-center rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-100 shadow-lg shadow-red-500/20 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteLoading ? "Siliniyor..." : deleteLabel}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function TextField({ label, name, value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm text-slate-200">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm shadow-inner shadow-slate-950/40 transition focus:border-sky-400 focus:outline-none"
      />
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}

