import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotesContext = createContext();

// Ensure this matches your server port (8000 based on your server.js)
const API_BASE = 'http://localhost:5000/api/notes';

export const useNotes = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error('useNotes must be used within a NotesProvider');
    }
    return context;
};

export const NotesProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('Saved'); // 'Saved', 'Saving...', 'Error'

    // Helper: Get Token from LocalStorage
    const getAuthHeaders = () => {
        const token = localStorage.getItem("token"); // Assuming you store JWT as 'token'
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    // 1. Fetch All Notes
    const fetchNotes = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE}/`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();

            if (data.ok) {
                setNotes(data.notes);
                // Set the first note as active if none is selected
                if (data.notes.length > 0 && !activeNoteId) {
                    setActiveNoteId(data.notes[0]._id);
                }
            } else {
                console.error("API Error:", data.error);
            }
        } catch (err) {
            console.error("Failed to fetch notes:", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeNoteId]);

    // 2. Create Note
    const createNote = async () => {
        try {
            const res = await fetch(`${API_BASE}/add`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: 'Untitled',
                    content: { blocks: [] }
                })
            });

            const data = await res.json();

            if (data.ok) {
                const newNote = data.note;
                setNotes(prev => [newNote, ...prev]);
                setActiveNoteId(newNote._id);
                return newNote;
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Failed to create note:", err);
        }
    };

    // 3. Update Note (Debounced/Optimistic)
    const updateNote = useCallback(async (id, updates) => {
        // Optimistic Update: Update UI immediately
        setNotes(prev => prev.map(n => n._id === id ? { ...n, ...updates } : n));
        setSaveStatus('Saving...');

        try {
            const res = await fetch(`${API_BASE}/update/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updates)
            });

            const data = await res.json();

            if (data.ok) {
                setSaveStatus('Saved');
            } else {
                setSaveStatus('Error');
                console.error(data.error);
            }
        } catch (err) {
            console.error("Failed to update note:", err);
            setSaveStatus('Error');
        }
    }, []);

    // 4. Delete Note
    const deleteNote = async (id) => {
        if (!window.confirm("Are you sure you want to delete this page?")) return;

        try {
            const res = await fetch(`${API_BASE}/delete/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await res.json();

            if (data.ok) {
                const remainingNotes = notes.filter(n => n._id !== id);
                setNotes(remainingNotes);

                // If we deleted the active note, switch to another one
                if (activeNoteId === id) {
                    setActiveNoteId(remainingNotes.length > 0 ? remainingNotes[0]._id : null);
                }
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Failed to delete note:", err);
        }
    };

    // 5. Share Note (Toggle)
    const shareNote = async (id) => {
        try {
            // Find current state to toggle it
            const currentNote = notes.find(n => n._id === id);
            const newShareState = !currentNote.isShared;

            const res = await fetch(`${API_BASE}/share/${id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ isShared: newShareState })
            });

            const data = await res.json();

            if (data.ok) {
                // Update local state with new share status and shareId
                setNotes(prev => prev.map(n => n._id === id ? {
                    ...n,
                    isShared: data.isShared,
                    shareId: data.shareId
                } : n));

                alert(data.message);
                return data.shareId; // Return ID in case UI needs to copy link immediately
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Failed to share note:", err);
        }
    };

    // Load initial data
    useEffect(() => {
        // Only fetch if we have a token (User is logged in)
        const token = localStorage.getItem("token");
        if (token) {
            fetchNotes();
        } else {
            setIsLoading(false); // Stop loading if no user
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const activeNote = notes.find(n => n._id === activeNoteId);

    const value = {
        notes,
        activeNote,
        activeNoteId,
        setActiveNoteId,
        createNote,
        updateNote,
        deleteNote,
        shareNote,
        isLoading,
        saveStatus
    };

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};