import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import CodeTool from "@editorjs/code";
import Embed from "@editorjs/embed";
import Paragraph from "@editorjs/paragraph";
import { useTheme } from "../../context/ThemeContext"; // Ensure path is correct
import { useNotes } from "../../context/DocContext"; // Ensure path is correct
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Copy, Check, FileText, Save, Globe } from "lucide-react";

const EditorNotionClean = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  // Use the new NotesContext
  const { notes, updateNote, shareNote, saveStatus } = useNotes();

  const editorRef = useRef(null);
  const holderRef = useRef(null);
  const shareMenuRef = useRef(null);

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Derive current document from notes list
  const currentDoc = useMemo(() => notes.find((n) => n._id === id), [notes, id]);

  // Handle specific save status for UI feedback
  const isSaving = saveStatus === 'Saving...';

  // 1. Save Function
  const saveDoc = useCallback(async () => {
    if (!currentDoc || !editorRef.current || !isEditorReady) return;

    try {
      const content = await editorRef.current.save();
      // Call Context update
      await updateNote(currentDoc._id, { content });
    } catch (err) {
      console.error("Saving failed:", err);
    }
  }, [currentDoc, isEditorReady, updateNote]);

  // 2. Keyboard Shortcut (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveDoc();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDoc]);

  // 3. Debounced Auto-save
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDoc();
    }, 1000);
  }, [saveDoc]);

  // 4. Handle Title Change
  const handleTitleChange = (e) => {
    const newTitle = e.target.innerText;
    // Debounce title updates slightly to avoid API spam
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      updateNote(id, { title: newTitle });
    }, 1000);
  };

  // 5. Handle Sharing
  const handleShareToggle = useCallback(async () => {
    await shareNote(id);
    // The context updates the local state 'isShared', forcing a re-render
  }, [id, shareNote]);

  const copyLink = useCallback(() => {
    // Assuming the public route is /shared/:id based on standard patterns
    const shareUrl = `${window.location.origin}/shared/${id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [id]);

  const handleBack = useCallback(async () => {
    if (isEditorReady) await saveDoc();
    navigate("/docs"); // Or wherever your dashboard is
  }, [saveDoc, navigate, isEditorReady]);

  // 6. Theme Application
  const applyThemeToBlocks = useCallback((currentTheme) => {
    if (!holderRef.current) return;
    try {
      const blocks = holderRef.current.querySelectorAll(".ce-block");
      blocks.forEach((block) => {
        block.style.color = currentTheme === "dark" ? "#e3e3e3" : "#37352f";
      });
    } catch (e) {
      console.log('Theme application failed:', e);
    }
  }, []);

  // 7. Initialize Editor
  useEffect(() => {
    // Wait for currentDoc to be loaded
    if (!currentDoc || !holderRef.current) return;

    // If editor exists, don't re-init
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      placeholder: "Press '/' for commands...",
      data: currentDoc.content || { blocks: [] },
      tools: {
        header: {
          class: Header,
          inlineToolbar: ["link", "bold", "italic"],
          config: { levels: [1, 2, 3], defaultLevel: 1 }
        },
        paragraph: {
          class: Paragraph,
          inlineToolbar: true
        },
        list: {
          class: List,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true
        },
        code: {
          class: CodeTool
        },
        embed: { class: Embed },
      },
      onChange: () => {
        // Trigger save on every change
        debouncedSave();
      },
      onReady: () => {
        setIsEditorReady(true);
        applyThemeToBlocks(theme);
      },
    });

    editorRef.current = editor;

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
      }
      editorRef.current = null;
    };
  }, [id]); // Re-run if ID changes, but ideally we stick to one instance per mount

  // Watch theme changes
  useEffect(() => {
    if (isEditorReady) applyThemeToBlocks(theme);
  }, [theme, isEditorReady, applyThemeToBlocks]);

  // Close share menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);


  // Loading State
  if (!currentDoc) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === 'dark' ? 'bg-[#191919] text-white' : 'bg-white text-black'}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-500 text-sm">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`notion-container ${theme === "dark" ? "dark" : "light"}`}>

      {/* --- Top Navigation Bar --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-transparent transition-colors duration-200">
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 rounded-lg transition-all"
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div className="text-xs text-neutral-400 mr-2 flex items-center gap-1.5">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                Saving...
              </>
            ) : saveStatus === 'Error' ? (
              <span className="text-red-500">Error saving</span>
            ) : (
              <>
                <Check size={12} />
                Saved
              </>
            )}
          </div>

          <div className="relative flex" ref={shareMenuRef}>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 border border-transparent
                ${currentDoc.isShared
                  ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
                }`}
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              {currentDoc.isShared ? <Globe size={16} /> : <Share2 size={16} />}
              <span>{currentDoc.isShared ? 'Shared' : 'Share'}</span>
            </button>

            {/* --- Share Dropdown --- */}
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-neutral-900 dark:text-white font-semibold text-sm truncate">
                        {currentDoc.title || "Untitled"}
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-1">
                        {currentDoc.isShared ? "Publicly accessible" : "Private to you"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Share Toggle Button */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">Share to web</span>
                    <button
                      onClick={handleShareToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900
                        ${currentDoc.isShared ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentDoc.isShared ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {currentDoc.isShared && (
                    <div className="animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2">
                          <p className="text-neutral-500 dark:text-neutral-400 text-xs truncate font-mono">
                            {`${window.location.origin}/shared/${id}`}
                          </p>
                        </div>
                        <button
                          onClick={copyLink}
                          className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
                          title="Copy link"
                        >
                          {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} className="text-neutral-500 dark:text-neutral-400" />}
                        </button>
                      </div>

                      <div className="text-xs text-neutral-500 text-center pb-2">
                        Anyone with the link can view this page
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Main Editor Area --- */}
      <div className="notion-page">
        <div className="document-header">
          {/* Editable Title */}
          <h1
            className="document-title outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleTitleChange}
            placeholder="Untitled"
          >
            {currentDoc.title}
          </h1>
          <p className="document-description">
            {new Date(currentDoc.updatedAt || Date.now()).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* EditorJS Holder */}
        <div ref={holderRef} className="notion-editor" />
      </div>

      {/* --- Styles (Preserved from original) --- */}
      <style>{`
        .notion-container {
          min-height: 100vh;
          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif;
          transition: background-color 0.2s ease;
        }
        .dark { background-color: #191919; color: #e3e3e3; }
        .light { background-color: #ffffff; color: #37352f; }
        .notion-page { max-width: 900px; margin: 0 auto; padding: 0 96px; }
        .document-header { padding-top: 100px; padding-bottom: 20px; }
        .document-title { font-size: 2.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 8px; color: inherit; }
        .document-title:empty:before { content: 'Untitled'; color: rgba(120,120,120,0.5); }
        .document-description { font-size: 0.9rem; color: rgba(55, 53, 47, 0.65); margin-bottom: 24px; }
        .dark .document-description { color: rgba(227, 227, 227, 0.6); }
        .notion-editor { padding-bottom: 30vh; min-height: 60vh; }
        
        /* EditorJS specific overrides for Dark/Light mode */
        .ce-block { padding: 3px 0; }
        .ce-paragraph { font-size: 1rem; line-height: 1.75; }
        .ce-header { font-weight: 700; margin: 0.8em 0 2px; }
        .ce-header h1 { font-size: 2.25rem; }
        .ce-header h2 { font-size: 1.875rem; }
        .ce-header h3 { font-size: 1.5rem; }
        
        /* Toolbar positioning */
        .ce-toolbar { left: -40px; }
        .ce-toolbar__plus, .ce-toolbar__settings-btn { 
            color: rgba(55, 53, 47, 0.4);
            display: flex; align-items: center; justify-content: center;
        }
        .dark .ce-toolbar__plus, .dark .ce-toolbar__settings-btn { color: rgba(227, 227, 227, 0.4); }
        .ce-toolbar__plus:hover, .ce-toolbar__settings-btn:hover { background-color: rgba(55, 53, 47, 0.08); }
        .dark .ce-toolbar__plus:hover, .dark .ce-toolbar__settings-btn:hover { background-color: rgba(255, 255, 255, 0.08); }

        /* Code Block */
        .ce-code__textarea {
          font-family: 'Monaco', monospace;
          background: rgba(242, 241, 238, 0.6);
          color: #37352f;
          border-radius: 8px;
          padding: 16px;
        }
        .dark .ce-code__textarea {
          background: rgba(255, 255, 255, 0.055);
          color: #e3e3e3;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .notion-page { padding: 0 20px; padding-left: 56px; }
          .document-title { font-size: 2rem; }
          .ce-toolbar { left: 10px !important; }
        }
      `}</style>
    </div>
  );
};

export default EditorNotionClean;