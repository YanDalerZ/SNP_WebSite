import { useState, useEffect } from 'react';
import { CLINICAL_MODULES } from './data/clinicalData';
import { type ClinicalModuleData } from './types/clinical';
import { useSharedDb } from './types/SharedDB';

interface NoteCardItem {
  id: string;
  title: string;
  items: string[];
  bulleted: boolean;
  numbered: boolean;
}

interface SavedRecord {
  id: number;
  member_id: string;
  member_name: string;
  summary_text: string;
  timestamp: string;
}

export default function App() {
  const [currentTabKey, setCurrentTabKey] = useState<string>('CLD');
  const activeModule: ClinicalModuleData & { guideContent?: any } =
    CLINICAL_MODULES[currentTabKey] || CLINICAL_MODULES['CLD'];

  const [copied, setCopied] = useState<boolean>(false);

  // Patient / Member Details State
  const [memberId, setMemberId] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');

  // Shared DB: auto-reopens the remembered file in the network folder on every load
  const { db, status, fileName: dbFileName, connect, createNew, reconnect, mutate } = useSharedDb();
  const [savedRecords, setSavedRecords] = useState<SavedRecord[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const showStartupModal = status === 'needs-file' || status === 'needs-permission';

  const refreshRecords = (database: any = db) => {
    if (!database) return;
    try {
      const stmt = database.prepare("SELECT id, member_id, member_name, summary_text, timestamp FROM summaries ORDER BY id DESC");
      const results: SavedRecord[] = [];
      while (stmt.step()) {
        const row = stmt.getAsObject() as unknown as SavedRecord;
        results.push(row);
      }
      stmt.free();
      setSavedRecords(results);
      if (results.length > 0 && selectedRecordId === null) {
        setSelectedRecordId(results[0].id);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  // Refresh the list whenever the shared DB is (re)loaded, including other users' changes
  useEffect(() => {
    if (db) refreshRecords(db);
  }, [db]);

  const handleConnectSharedDb = () => connect();

  // Persistent Summary Cards
  const [noteCards, setNoteCards] = useState<NoteCardItem[]>([
    { id: 'risk', title: 'RISKS ADDRESSED:', items: [], bulleted: false, numbered: false },
    { id: 'followUp', title: 'FOLLOW-UP FROM PREVIOUS CALL:', items: [], bulleted: false, numbered: false },
    { id: 'status', title: 'MEMBERS CURRENT STATUS:', items: [], bulleted: false, numbered: false },
    { id: 'barriers', title: 'BARRIERS:', items: [], bulleted: false, numbered: false },
    { id: 'interventions', title: 'INTERVENTIONS:', items: [], bulleted: false, numbered: false },
    { id: 'education', title: 'EDUCATION:', items: [], bulleted: false, numbered: false },
    { id: 'coordination', title: 'COORDINATION:', items: [], bulleted: false, numbered: false },
    { id: 'hwSent', title: 'HEALTHWISE MATERIALS SENT:', items: [], bulleted: false, numbered: false },
    { id: 'actionPlan', title: 'CARE COACH and MEMBER ACTION PLAN:', items: [], bulleted: false, numbered: false },
    { id: 'articlesReview', title: 'Healthwise Articles to review and send: PREVENTION/TREATMENT', items: [], bulleted: false, numbered: false },
    { id: 'exercise', title: 'EXERCISE:', items: [], bulleted: false, numbered: false },
    { id: 'nutrition', title: 'NUTRITION:', items: [], bulleted: false, numbered: false }
  ]);

  const [selectedCardId, setSelectedCardId] = useState<string>('risk');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Editable Summary Text State
  const [customSummaryText, setCustomSummaryText] = useState<string>('');
  const [isSummaryEdited, setIsSummaryEdited] = useState<boolean>(false);

  const appendToActiveCard = (text: string) => {
    if (!text.trim()) return;
    setNoteCards(prev =>
      prev.map(card =>
        card.id === selectedCardId ? { ...card, items: [...card.items, text] } : card
      )
    );
  };

  const handleAddCustomItem = (cardId: string) => {
    const val = inputValues[cardId];
    if (!val || !val.trim()) return;
    setNoteCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, items: [...card.items, val.trim()] } : card
      )
    );
    setInputValues({ ...inputValues, [cardId]: '' });
  };

  const handleRemoveItem = (cardId: string, index: number) => {
    setNoteCards(prev =>
      prev.map(card =>
        card.id === cardId
          ? { ...card, items: card.items.filter((_, i) => i !== index) }
          : card
      )
    );
  };

  const handleClearNotes = () => {
    setNoteCards(prev => prev.map(card => ({ ...card, items: [], bulleted: false, numbered: false })));
    setCustomSummaryText('');
    setIsSummaryEdited(false);
    setMemberId('');
    setMemberName('');
  };

  const toggleBullet = (cardId: string) => {
    setNoteCards(prev =>
      prev.map(card =>
        card.id === cardId
          ? { ...card, bulleted: !card.bulleted, numbered: false }
          : card
      )
    );
  };

  const toggleNumbered = (cardId: string) => {
    setNoteCards(prev =>
      prev.map(card =>
        card.id === cardId
          ? { ...card, numbered: !card.numbered, bulleted: false }
          : card
      )
    );
  };

  const checklistBodyText = noteCards
    .filter(card => card.items.length > 0)
    .map(card => {
      const formattedItems = card.items.map((item, idx) => {
        if (card.bulleted) return `• ${item}`;
        if (card.numbered) return `${idx + 1}. ${item}`;
        return item;
      });
      return `${card.title}\n${formattedItems.join('\n')}`;
    })
    .join('\n\n');

  const getFullSummaryWithHeader = () => {
    return checklistBodyText;
  };

  useEffect(() => {
    if (!isSummaryEdited) {
      setCustomSummaryText(getFullSummaryWithHeader());
    }
  }, [noteCards, memberId, memberName, isSummaryEdited, checklistBodyText]);

  const handleCopySummary = () => {
    if (!customSummaryText.trim()) return;
    navigator.clipboard.writeText(customSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // READ-FIRST-THEN-WRITE: re-reads the shared file, inserts, verifies nobody else
  // wrote in between (retries if they did), then writes back.
  const handleSaveToDatabase = async () => {
    if (status !== 'connected') {
      alert('No shared database file connected. Please connect the shared DB first.');
      return;
    }

    try {
      const timestamp = new Date().toLocaleString();
      await mutate(latest => {
        latest.run(
          `INSERT INTO summaries (member_id, member_name, summary_text, timestamp) VALUES (?, ?, ?, ?)`,
          [memberId.trim(), memberName.trim(), customSummaryText, timestamp]
        );
      });
      alert('Successfully synced and saved to the shared network database!');
    } catch (err) {
      console.error('Read-then-write error:', err);
      alert('Error saving to shared database. Make sure you have network access and try again.');
    }
  };

  const handleExportExcel = () => {
    if (!savedRecords.length) {
      alert('No saved records to export.');
      return;
    }

    const headers = ['ID', 'Member ID', 'Member Name', 'Timestamp', 'Summary Text'];
    const rows = savedRecords.map(rec => [
      rec.id,
      `"${(rec.member_id || '').replace(/"/g, '""')}"`,
      `"${(rec.member_name || '').replace(/"/g, '""')}"`,
      `"${(rec.timestamp || '').replace(/"/g, '""')}"`,
      `"${(rec.summary_text || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `smart_doctool_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeRecord = savedRecords.find(r => r.id === selectedRecordId) || savedRecords[0];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none">

      {/* HEADER */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md bg-white">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="font-bold text-slate-800 text-sm tracking-wide">Smart DocTool</h1>
            <p className="text-[10px] text-slate-500 font-mono">DB: {dbFileName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleConnectSharedDb}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-2xs"
            title="Change connected shared database file"
          >
            Connect Shared DB
          </button>
          <button
            onClick={() => { refreshRecords(); setShowHistoryModal(true); }}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition shadow-2xs"
          >
            View Saved Records ({savedRecords.length})
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-2xs"
            title="Export saved records to Excel CSV file"
          >
            Export to Excel
          </button>
        </div>
      </header>

      {/* NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto shadow-xs">
        {Object.keys(CLINICAL_MODULES).map(key => {
          const mod = CLINICAL_MODULES[key];
          const isActive = currentTabKey === key;
          return (
            <button
              key={key}
              onClick={() => setCurrentTabKey(key)}
              className={`px-4 py-2 text-xs font-semibold rounded-md transition whitespace-nowrap ${isActive
                ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
            >
              {mod.title}
            </button>
          );
        })}
      </nav>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1920px] w-full mx-auto overflow-hidden">

        {/* LEFT COLUMN: NOTES & SUMMARY CARDS */}
        <aside className="w-full lg:w-96 bg-white border border-slate-300 rounded-lg p-3.5 flex flex-col shadow-xs max-h-[85vh]">

          {/* PATIENT / MEMBER INFO FIELDS */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 mb-3 space-y-2">
            <span className="font-bold text-[11px] uppercase text-slate-700 tracking-wider block">Patient / Member Info</span>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Member ID</label>
              <input
                type="text"
                placeholder="Enter Member ID..."
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Member Name</label>
              <input
                type="text"
                placeholder="Enter Member Name..."
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
            <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">Notes Checklist</span>
            <button
              onClick={handleClearNotes}
              className="bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded transition shadow-xs"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {noteCards.map(card => {
              const isSelected = selectedCardId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`border rounded-md p-2.5 transition cursor-pointer ${isSelected
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                    <span className="truncate pr-1">{card.title}</span>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleBullet(card.id)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${card.bulleted
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        title="Toggle Bullet List"
                      >
                        •
                      </button>
                      <button
                        onClick={() => toggleNumbered(card.id)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition ${card.numbered
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                          }`}
                        title="Toggle Numbered List"
                      >
                        123
                      </button>
                      <span className="ml-1 text-slate-400 font-normal">({card.items.length})</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2">
                    {card.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 px-2 py-1 rounded text-xs shadow-2xs">
                        <span className="truncate pr-2">
                          {card.bulleted ? `• ${item}` : card.numbered ? `${idx + 1}. ${item}` : item}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(card.id, idx); }}
                          className="text-red-500 hover:text-red-700 font-bold px-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Add custom note..."
                      value={inputValues[card.id] || ''}
                      onChange={(e) => setInputValues({ ...inputValues, [card.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomItem(card.id); }}
                      className="flex-1 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white"
                    />
                    <button
                      onClick={() => handleAddCustomItem(card.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 rounded font-bold text-xs shadow-2xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MIDDLE COLUMN: CLINICAL MODULE CONTENT */}
        <main className="flex-1 bg-white border border-slate-300 rounded-lg p-6 overflow-y-auto max-h-[85vh] space-y-6 shadow-xs">
          {currentTabKey === 'TeachBack' ? (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h1 className="text-2xl font-bold text-slate-900">Teach Back Method</h1>
                <p className="text-xs text-slate-400 mt-1">Friday, September 18, 2026 10:59 AM</p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-900">Sample Teach-back video:</span>
                <a
                  href="https://url.uk.m.mimecastprotect.com/s/1u2oCv9D9s7vYGRrFJSlliQHFKT?domain=youtu.be"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Teach back - a technique for clear communication
                </a>
              </div>

              <div className="my-3 rounded-lg overflow-hidden flex justify-center w-full mx-auto">
                <img
                  src="TeachBack.png"
                  alt="Teach Back Method Graphic"
                  className="w-[50%] object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                <p>
                  Teach-back, also known as the <strong className="italic font-bold">"show-me"</strong> method, is a health communication strategy used to ensure that patients or caregivers understand medical information or instructions.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{activeModule.title}</h1>
                <p className="text-xs italic text-slate-500 mt-1">{activeModule.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
                <span className="font-bold text-slate-600">HW ARTICLES:</span>
                {activeModule.articles.map((art, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5 bg-white border border-slate-200 px-2 py-1 rounded">
                    <a
                      href={art.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {art.title}
                    </a>
                    <button
                      onClick={() => appendToActiveCard(`Healthwise Article sent: ${art.title} (${art.url})`)}
                      className="bg-blue-600 hover:bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] shadow-2xs"
                      title="Append article to selected card"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-[#2e7d32] text-white px-4 py-2 font-bold text-xs tracking-wide">
                  {activeModule.quickDiffHeader}
                </div>
                <div className="divide-y divide-slate-200">
                  {activeModule.quickDiff.map((row, idx) => (
                    <div
                      key={idx}
                      onClick={() => appendToActiveCard(`${row.condition}: ${row.pattern}`)}
                      className="grid grid-cols-1 md:grid-cols-3 p-3 hover:bg-slate-50 cursor-pointer transition text-xs items-center"
                    >
                      <div className="font-bold text-slate-800">{row.condition}</div>
                      <div className="md:col-span-2 text-slate-600 whitespace-pre-line">{row.pattern}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-[#005a9e] text-white px-4 py-2 font-bold text-xs tracking-wide">
                  CONDITIONS, PROBING QUESTIONS & SYMPTOMS
                </div>
                <div className="divide-y divide-slate-200">
                  {activeModule.probing.map((prob, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 lg:grid-cols-3 p-3.5 gap-3 hover:bg-slate-50 transition text-xs items-center"
                    >
                      <div
                        onClick={() => appendToActiveCard(prob.condition)}
                        className="font-bold text-slate-800 cursor-pointer p-2 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded"
                      >
                        {prob.condition}
                      </div>
                      <div
                        onClick={() => appendToActiveCard(prob.question)}
                        className="text-slate-700 cursor-pointer p-2 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded whitespace-pre-line"
                      >
                        {prob.question}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {prob.symptoms.map((sym, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => appendToActiveCard(sym)}
                            className="bg-[#eff6fc] hover:bg-[#0078d4] hover:text-white text-[#005a9e] border border-[#c7e0f4] px-2 py-1 rounded font-semibold text-[11px] transition shadow-2xs"
                          >
                            + {sym}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>

        {/* RIGHT COLUMN: SUMMARY OUTPUT PANEL */}
        <section className="w-full lg:w-96 bg-white border border-slate-300 rounded-lg p-3.5 flex flex-col shadow-xs max-h-[85vh]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-blue-600 uppercase tracking-wider">Summary Generator</span>
              {isSummaryEdited && (
                <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.5 rounded border border-amber-200">
                  Edited
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleSaveToDatabase}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded transition shadow-xs"
                title="Read latest shared DB, append record, and write back"
              >
                Save
              </button>
              <button
                onClick={handleCopySummary}
                className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded transition shadow-xs"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <textarea
            value={customSummaryText}
            onChange={(e) => {
              setCustomSummaryText(e.target.value);
              setIsSummaryEdited(true);
            }}
            placeholder="summary will appear here automatically..."
            className="w-full flex-1 bg-slate-50 border border-slate-300 rounded-md p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white resize-none font-mono shadow-inner transition"
            rows={25}
          />
        </section>

      </div>

      {/* STARTUP MODAL (only when the remembered file can't be opened automatically) */}
      {showStartupModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 flex flex-col shadow-2xl border border-slate-200 space-y-4 text-center">
            <h3 className="font-bold text-lg text-slate-800">
              {status === 'needs-permission' ? 'Reconnect Shared Database' : 'Connect Shared Network Database'}
            </h3>
            <p className="text-xs text-slate-600">
              {status === 'needs-permission'
                ? <>Click below to reopen <code className="bg-slate-100 px-1 py-0.5 rounded">{dbFileName}</code> from the shared folder. Choose "Allow on every visit" in Chrome to skip this next time.</>
                : <>Select the shared SQLite database (<code className="bg-slate-100 px-1 py-0.5 rounded">.db</code>) in your network folder. It is remembered, so it opens automatically next time.</>}
            </p>
            <div className="pt-2 space-y-2">
              {status === 'needs-permission' && (
                <button
                  onClick={reconnect}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-6 rounded transition shadow-xs w-full"
                >
                  Reconnect to {dbFileName}
                </button>
              )}
              <button
                onClick={handleConnectSharedDb}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2.5 px-6 rounded transition shadow-xs w-full"
              >
                Select Shared .db File
              </button>
              {status === 'needs-file' && (
                <button
                  onClick={createNew}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2.5 px-6 rounded transition shadow-xs w-full"
                >
                  Create New .db File (first-time setup)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SAVED RECORDS HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-800">Saved Records History ({savedRecords.length})</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg px-2">✕</button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r border-slate-200 overflow-y-auto bg-slate-50/50 divide-y divide-slate-200">
                {savedRecords.map(rec => (
                  <div key={rec.id} onClick={() => setSelectedRecordId(rec.id)} className="p-3.5 cursor-pointer hover:bg-slate-100">
                    <div className="font-bold text-xs text-slate-800">{rec.member_name || 'Unnamed'}</div>
                    <div className="text-[10px] text-slate-500">{rec.timestamp}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1 flex flex-col p-5 bg-white overflow-y-auto">
                {activeRecord && (
                  <textarea readOnly value={activeRecord.summary_text} className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-md p-3 text-xs font-mono" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}