import UserListClient from "@/components/UserListClient";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <UserListClient />
      </div>
    </main>
  );
}
