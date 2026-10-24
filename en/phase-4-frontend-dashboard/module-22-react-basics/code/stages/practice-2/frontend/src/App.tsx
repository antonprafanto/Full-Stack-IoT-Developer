// App.tsx - the dashboard's top component. For now it only holds one heading,
// just proof that React and Tailwind already work. Other components follow from Practice 3 on.
export default function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      {/* className = the class attribute in HTML; it holds Tailwind's small classes */}
      <h1 className="text-3xl font-bold text-teal-700">Mini Smart Home</h1>
      <p className="mt-2 text-slate-600">Dashboard v0.1 is under construction.</p>
    </main>
  );
}
