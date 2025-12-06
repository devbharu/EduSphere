import { useNavigate } from "react-router-dom";
import { FileText, Trash2, X, Plus, Search, ArrowUpDown, Calendar, Clock, PenLine, Share2, ArrowLeft } from "lucide-react";
import { useState, useMemo } from "react";
// Import the new Context
import { useNotes } from "../../context/DocContext"; // Ensure this path is correct

const NotesList = () => {
    // 1. Use the new Context variables
    const { notes, isLoading, deleteNote, createNote, updateNote } = useNotes();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    // --- Delete Modal State ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    // --- Create Modal State ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNoteData, setNewNoteData] = useState({ title: "" });
    const [isCreating, setIsCreating] = useState(false);

    // Filter and Sort Notes
    const processedNotes = useMemo(() => {
        if (!Array.isArray(notes)) return [];

        // 1. Filter
        let filtered = notes.filter((note) =>
            (note.title || "Untitled").toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 2. Sort
        return filtered.sort((a, b) => {
            const dateA = new Date(a.updatedAt || 0);
            const dateB = new Date(b.updatedAt || 0);
            const titleA = (a.title || "").toLowerCase();
            const titleB = (b.title || "").toLowerCase();

            switch (sortBy) {
                case "newest": return dateB - dateA;
                case "oldest": return dateA - dateB;
                case "a-z": return titleA.localeCompare(titleB);
                case "z-a": return titleB.localeCompare(titleA);
                default: return dateB - dateA;
            }
        });
    }, [notes, searchQuery, sortBy]);

    // --- Handlers ---

    // 1. Open the Create Modal
    const openCreateModal = () => {
        setNewNoteData({ title: "" });
        setShowCreateModal(true);
    };

    // 2. Submit the New Note
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!newNoteData.title.trim()) return;

        setIsCreating(true);
        try {
            // Step A: Create the blank note in DB via Context
            const newNote = await createNote();

            if (newNote && newNote._id) {
                // Step B: Immediately update it with the user's chosen title
                // We do this silently so the user lands on a note with the correct title
                await updateNote(newNote._id, { title: newNoteData.title });

                setShowCreateModal(false);
                // Step C: Navigate to the editor (using _id)
                navigate(`/docs/${newNote._id}`);
            }
        } catch (error) {
            console.error("Failed to create note", error);
        } finally {
            setIsCreating(false);
        }
    };

    // 3. Delete Handlers
    const handleDeleteClick = (e, note) => {
        e.stopPropagation(); // Prevent navigating to note when clicking delete
        setNoteToDelete(note);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (noteToDelete && noteToDelete._id) {
            // Note: If your Context has window.confirm inside deleteNote, 
            // you might get a double confirmation. 
            // Ideally, remove window.confirm from Context if using this custom modal.
            await deleteNote(noteToDelete._id);
            setShowDeleteModal(false);
            setNoteToDelete(null);
        }
    };

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-8 font-sans">

            {/* --- Header Control Bar --- */}
            <div className="max-w-7xl mx-auto mb-8 space-y-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span>Back to Dashboard</span>
                </button>

                {/* Title & Controls */}
                <div className="md:flex md:items-center md:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Title & Count */}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            My Notes
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isLoading ? "Syncing..." : `${processedNotes.length} notes found`}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {/* Search Input */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full sm:w-48 pl-10 pr-8 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer transition-all shadow-sm text-gray-700 dark:text-gray-300"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="a-z">Name (A-Z)</option>
                                <option value="z-a">Name (Z-A)</option>
                            </select>
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={openCreateModal}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Note</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Content Grid --- */}
            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="mb-4 border-4 border-indigo-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
                        <p>Loading your workspace...</p>
                    </div>
                ) : processedNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery ? "No matching notes" : "No notes yet"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">
                            {searchQuery
                                ? "Try adjusting your search terms"
                                : "Create your first note to get started."}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={openCreateModal}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                            >
                                Create Note
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {processedNotes.map((note, index) => (
                            <div
                                key={note._id}
                                onClick={() => navigate(`/docs/${note._id}`)}
                                style={{ animationDelay: `${index * 50}ms` }}
                                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/20 cursor-pointer transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                            >
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${note.isShared ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                                        {note.isShared ? <Share2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleDeleteClick(e, note)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {note.title || "Untitled"}
                                </h3>

                                {/* Status Indicator */}
                                <div className="flex gap-2 mb-4">
                                    {note.isShared && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            Public
                                        </span>
                                    )}
                                </div>

                                {/* Card Footer (Time) */}
                                <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{formatDate(note.updatedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{formatTime(note.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- CREATE NOTE MODAL --- */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                        onClick={() => setShowCreateModal(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <FileText className="w-5 h-5" />
                                </span>
                                New Note
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                                    Title
                                </label>
                                <div className="relative">
                                    <PenLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="e.g., Project Ideas"
                                        value={newNoteData.title}
                                        onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating || !newNoteData.title.trim()}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Create & Open</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- DELETE CONFIRMATION MODAL --- */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                        onClick={() => setShowDeleteModal(false)}
                    />
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 dark:border-gray-700 transform transition-all animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                Delete Note?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-gray-200">"{noteToDelete?.title}"</span>? This action cannot be undone.
                            </p>
                            <div className="flex w-full gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesList;