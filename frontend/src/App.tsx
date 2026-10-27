import { useState } from 'react';

interface DocItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  lastUpdated: string;
}

const initialDocs: DocItem[] = [
  { id: '1', title: 'Billing Disruption Protocol 2026', category: 'Billing', summary: 'Steps to handle subscriber account disputes and credit adjustments.', lastUpdated: '2026-10-28' },
  { id: '2', title: 'Escalation Matrix for Tier-2 Support', category: 'Escalations', summary: 'Direct channels for high-priority technical drop-offs and system errors.', lastUpdated: '2026-10-27' },
  { id: '3', title: 'Network Outage Script & FAQ', category: 'Technical', summary: 'Approved customer-facing responses during regional server maintenance.', lastUpdated: '2026-10-25' },
];

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [docs] = useState<DocItem[]>(initialDocs);

  const filteredDocs = docs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-lg">SNP</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Agent Command & Doc Portal</h1>
            <p className="text-xs text-slate-400">Sagility Philippines B.V. — Internal Knowledge Base</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
            ● System Online (Firestore)
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">

        {/* Search & Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 backdrop-blur-sm">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search call scripts, procedures, policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-lg shadow-blue-600/20">
            + New Documentation Article
          </button>
        </div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="bg-slate-800 border border-slate-700/80 rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/20">
                    {doc.category}
                  </span>
                  <span className="text-xs text-slate-400">Updated {doc.lastUpdated}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{doc.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-3">{doc.summary}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition flex items-center space-x-1">
                  <span>Read Article &rarr;</span>
                </button>
                <span className="text-xs text-slate-400">ID: #{doc.id}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-16 bg-slate-800/30 rounded-xl border border-slate-700/40">
            <p className="text-slate-400 text-sm">No documentation found matching your search term.</p>
          </div>
        )}
      </main>
    </div>
  );
}