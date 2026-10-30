import { useState, useEffect } from 'react';
import { useSharedDb } from './types/SharedDB';

interface SavedRecord {
    id: number;
    member_id: string;
    member_name: string;
    summary_text: string;
    timestamp: string;
}

export default function Support() {
    // Shared DB: auto-reopens the remembered file in the network folder on every load
    const { db, status, fileName: dbFileName, connect, reconnect, reload, mutate } = useSharedDb();
    const [records, setRecords] = useState<SavedRecord[]>([]);

    // Selected Row for Preview & Editing
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

    // Form State for Create / Edit
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
    const [formMemberId, setFormMemberId] = useState<string>('');
    const [formMemberName, setFormMemberName] = useState<string>('');
    const [formSummaryText, setFormSummaryText] = useState<string>('');
    const [formTimestamp, setFormTimestamp] = useState<string>('');

    // Search / Filter
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Refresh the list whenever the shared DB is (re)loaded, including other users' changes
    useEffect(() => {
        if (db) refreshRecords(db);
    }, [db]);

    // Fetch all rows from the database
    const refreshRecords = (database = db) => {
        if (!database) return;
        try {
            const stmt = database.prepare("SELECT id, member_id, member_name, summary_text, timestamp FROM summaries ORDER BY id DESC");
            const results: SavedRecord[] = [];
            while (stmt.step()) {
                results.push(stmt.getAsObject() as unknown as SavedRecord);
            }
            stmt.free();
            setRecords(results);

            // Auto-select first record if present
            if (results.length > 0 && selectedRecordId === null) {
                selectRecordForView(results[0]);
            }
        } catch (err) {
            console.error('Error fetching records:', err);
        }
    };

    // Populate form fields when a row is selected
    const selectRecordForView = (record: SavedRecord) => {
        setSelectedRecordId(record.id);
        setFormMemberId(record.member_id || '');
        setFormMemberName(record.member_name || '');
        setFormSummaryText(record.summary_text || '');
        setFormTimestamp(record.timestamp || '');
        setIsEditing(false);
        setIsCreatingNew(false);
    };

    // 3. EXPORT TO EXCEL (CSV)
    const handleExportExcel = () => {
        if (!records.length) {
            alert('No saved records to export.');
            return;
        }

        const headers = ['ID', 'Member ID', 'Member Name', 'Timestamp', 'Summary Text'];
        const rows = records.map(rec => [
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
        link.setAttribute('download', `smart_doctool_support_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // CREATE: Start fresh entry
    const handleStartCreate = () => {
        setIsCreatingNew(true);
        setIsEditing(true);
        setSelectedRecordId(null);
        setFormMemberId('');
        setFormMemberName('');
        setFormSummaryText('');
        setFormTimestamp(new Date().toLocaleString());
    };

    // SAVE ENTRY (CREATE or UPDATE): re-reads the shared file, applies the change, writes back
    const handleSaveRecord = async () => {
        if (status !== 'connected') {
            alert('Not connected to the shared database.');
            return;
        }

        try {
            if (isCreatingNew) {
                const ts = formTimestamp.trim() || new Date().toLocaleString();
                await mutate(d => d.run(
                    `INSERT INTO summaries (member_id, member_name, summary_text, timestamp) VALUES (?, ?, ?, ?)`,
                    [formMemberId.trim(), formMemberName.trim(), formSummaryText, ts]
                ));
                alert('New record created successfully!');
            } else if (selectedRecordId !== null) {
                await mutate(d => d.run(
                    `UPDATE summaries SET member_id = ?, member_name = ?, summary_text = ?, timestamp = ? WHERE id = ?`,
                    [formMemberId.trim(), formMemberName.trim(), formSummaryText, formTimestamp, selectedRecordId]
                ));
                alert(`Record ID ${selectedRecordId} updated successfully!`);
            }
            setIsEditing(false);
            setIsCreatingNew(false);
        } catch (err) {
            console.error('Save error:', err);
            alert('Error saving to shared database. Make sure you have network access and try again.');
        }
    };

    // DELETE: Remove row (against the freshly re-read shared file)
    const handleDeleteRecord = async (id: number) => {
        if (status !== 'connected') {
            alert('Not connected to the shared database.');
            return;
        }
        if (!confirm(`Are you sure you want to delete record ID ${id}?`)) return;

        try {
            await mutate(d => d.run(`DELETE FROM summaries WHERE id = ?`, [id]));

            if (selectedRecordId === id) {
                setSelectedRecordId(null);
                setFormMemberId('');
                setFormMemberName('');
                setFormSummaryText('');
                setFormTimestamp('');
            }
            alert(`Record ID ${id} deleted.`);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting from shared database. Make sure you have network access and try again.');
        }
    };

    // Filter records by search term
    const filteredRecords = records.filter(rec =>
        (rec.member_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.member_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rec.summary_text || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeRecord = records.find(r => r.id === selectedRecordId);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans select-none">

            {/* SUPPORT PAGE HEADER */}
            <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between shadow-md bg-white">
                <div className="flex items-center space-x-3">
                    <h1 className="font-bold text-slate-800 text-sm tracking-wide">
                        Smart DocTool — Database Support & CRUD
                    </h1>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-300 font-mono">
                        {dbFileName}
                    </span>
                </div>

                {/* HEADER TOOLBAR BUTTONS */}
                <div className="flex items-center space-x-2">
                    {status === 'needs-permission' && (
                        <button
                            onClick={reconnect}
                            className="bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-2xs"
                            title="Re-grant access to the remembered shared database"
                        >
                            Reconnect DB
                        </button>
                    )}
                    <button
                        onClick={connect}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-2xs"
                        title="Choose a different shared SQLite .db file"
                    >
                        Open DB
                    </button>
                    <button
                        onClick={reload}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-2xs"
                        title="Reload the latest records from the shared file"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleExportExcel}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-2xs"
                        title="Export all records to Excel CSV"
                    >
                        Export to Excel
                    </button>
                </div>
            </header>

            {/* MAIN WORKSPACE GRID */}
            <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 max-w-[1920px] w-full mx-auto overflow-hidden">

                {/* LEFT PANEL: ROW LISTING & SEARCH */}
                <aside className="w-full lg:w-96 bg-white border border-slate-300 rounded-lg p-3.5 flex flex-col shadow-xs max-h-[85vh]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                        <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                            Records ({filteredRecords.length})
                        </span>
                        <button
                            onClick={handleStartCreate}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold px-3 py-1 rounded transition shadow-xs"
                        >
                            + Add New
                        </button>
                    </div>

                    {/* SEARCH FILTER INPUT */}
                    <input
                        type="text"
                        placeholder="Filter by Name, ID, or text..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 mb-3"
                    />

                    {/* ROW CARDS LIST */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                        {filteredRecords.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">No matching records found.</p>
                        ) : (
                            filteredRecords.map(rec => {
                                const isSelected = selectedRecordId === rec.id && !isCreatingNew;
                                return (
                                    <div
                                        key={rec.id}
                                        onClick={() => selectRecordForView(rec)}
                                        className={`p-3 rounded-md transition cursor-pointer flex items-center justify-between ${isSelected
                                            ? 'bg-blue-50 border border-blue-400 ring-1 ring-blue-400/30'
                                            : 'bg-white hover:bg-slate-50 border border-slate-200'
                                            }`}
                                    >
                                        <div className="truncate pr-2">
                                            <div className="font-bold text-xs text-slate-800 truncate">
                                                {rec.member_name || 'Unnamed Member'}
                                            </div>
                                            <div className="text-[10px] text-slate-500">
                                                {rec.member_id ? `ID: ${rec.member_id}` : 'No Member ID'} • {rec.timestamp}
                                            </div>
                                        </div>

                                        {/* DELETE BUTTON ON ROW CARD */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteRecord(rec.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-2 py-1 rounded text-xs transition"
                                            title="Delete row"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* RIGHT PANEL: DETAIL VIEW & EDITOR FORM */}
                <main className="flex-1 bg-white border border-slate-300 rounded-lg p-6 flex flex-col max-h-[85vh] shadow-xs overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                        <div>
                            <h2 className="font-bold text-base text-slate-800">
                                {isCreatingNew
                                    ? 'Create New Record'
                                    : isEditing
                                        ? `Editing Record ID #${selectedRecordId}`
                                        : selectedRecordId
                                            ? `Record ID #${selectedRecordId}`
                                            : 'Select a Record'}
                            </h2>
                        </div>

                        {/* ACTION CONTROLS */}
                        <div className="flex items-center space-x-2">
                            {!isEditing && selectedRecordId !== null && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-xs"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteRecord(selectedRecordId)}
                                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded transition shadow-xs"
                                    >
                                        Delete
                                    </button>
                                </>
                            )}

                            {isEditing && (
                                <>
                                    <button
                                        onClick={handleSaveRecord}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded transition shadow-xs"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setIsCreatingNew(false);
                                            if (activeRecord) selectRecordForView(activeRecord);
                                        }}
                                        className="bg-slate-300 hover:bg-slate-400 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* DETAIL FORM / VIEW */}
                    {selectedRecordId !== null || isCreatingNew ? (
                        <div className="flex-1 flex flex-col space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Member ID</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formMemberId}
                                        onChange={(e) => setFormMemberId(e.target.value)}
                                        placeholder="Member ID..."
                                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Member Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formMemberName}
                                        onChange={(e) => setFormMemberName(e.target.value)}
                                        placeholder="Member Name..."
                                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Timestamp</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={formTimestamp}
                                        onChange={(e) => setFormTimestamp(e.target.value)}
                                        placeholder="Timestamp..."
                                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-600 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-[350px]">
                                <label className="block text-[11px] font-bold text-slate-600 mb-1">Summary Text</label>
                                <textarea
                                    disabled={!isEditing}
                                    value={formSummaryText}
                                    onChange={(e) => setFormSummaryText(e.target.value)}
                                    placeholder="Summary contents..."
                                    className="w-full flex-1 border border-slate-300 rounded-md p-3 text-xs bg-slate-50 disabled:bg-slate-100 disabled:text-slate-700 font-mono resize-none focus:outline-none focus:border-blue-500 focus:bg-white transition"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                            Select a row from the left panel to inspect or edit, or click "+ Add New" to create a row.
                        </div>
                    )}
                </main>

            </div>

        </div>
    );
}