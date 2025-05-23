// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error caught by boundary:", error);
    console.log("Component stack:", info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return <h1 className="text-white p-4">Something went wrong: {this.state.error?.toString()}</h1>;
    }
    return this.props.children;
  }
}

function App() {
  const [notes, setNotes] = React.useState(() => {
    try {
      const saved = localStorage.getItem('notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing localStorage:", e);
      return [];
    }
  });
  const [editingNoteId, setEditingNoteId] = React.useState(null);

  React.useEffect(() => {
    try {
      localStorage.setItem('notes', JSON.stringify(notes));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }, [notes]);

  // Function to place cursor at the end of a contentEditable element
  const placeCursorAtEnd = (element) => {
    if (!element) return;
    
    element.focus();

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false); // Collapse to end
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  // Focus the editor and place cursor at end
  const focusEditor = (noteId) => {
    setTimeout(() => {
      const editor = document.querySelector(`div[data-note-id="${noteId}"]`);
      if (editor) placeCursorAtEnd(editor);
    }, 10);
  };

  // Handle note clicks - set editing mode and focus
  const handleNoteClick = (note) => {
    setEditingNoteId(note.id);
    setTimeout(() => focusEditor(note.id), 10);
  };

  // Handle content change and keep cursor at end
  const handleContentChange = (id, event) => {
    const content = event.currentTarget.innerHTML;
    updateNoteContent(id, 'content', content);

    // Re-position cursor
    setTimeout(() => placeCursorAtEnd(event.currentTarget), 10);
  };

  const updateNoteContent = (id, field, value) => {
    setNotes(notes.map(note =>
      note.id === id ? { ...note, [field]: value, isNew: false } : note
    ));
  };

  // Handle editor clicks - prevent event bubbling
  const handleEditorClick = (e) => {
    e.stopPropagation();
  };

  const deleteNote = (id, e) => {
    e.stopPropagation();
    setNotes(notes.filter(note => note.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
    }
  };

  const handleNewNoteClick = () => {
    const newNote = {
      id: Date.now(),
      title: `note-${notes.length + 1}`,
      content: '',
      color: colors[notes.length % colors.length]
    };
    setNotes([...notes, newNote]);
    setEditingNoteId(newNote.id);
  };

  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-orange-500'];

  return (
    <div className="min-h-screen bg-gray-900 p-10 flex flex-col">
      {/* Notes Grid */}
      <div className="grid grid-cols-3 gap-6">
        {notes.map(note => (
          <div
            key={note.id}
            className={`${note.color} p-6 rounded-3xl cursor-pointer flex flex-col justify-between min-h-[200px]`}
            onClick={() => handleNoteClick(note)}
          >
            <div className="flex-grow">
              {editingNoteId === note.id ? (
                <input
                  type="text"
                  value={note.title}
                  onChange={(e) => updateNoteContent(note.id, 'title', e.target.value)}
                  className="w-full bg-transparent font-jockey-one font-bold text-2xl text-black mb-2 outline-none border-b border-black pb-1"
                  placeholder="Note Title"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h3 className="font-jockey-one font-bold text-2xl text-black mb-2">{note.title}</h3>
              )}

              {editingNoteId === note.id ? (
                <div
                  className="w-full bg-transparent text-black text-sm min-h-[4.5rem] outline-none border-none overflow-auto p-1"
                  contentEditable
                  onInput={(e) => handleContentChange(note.id, e)}
                  dangerouslySetInnerHTML={{ __html: note.content || '' }}
                  data-note-id={note.id}
                  onClick={handleEditorClick}
                  style={{ whiteSpace: 'pre-wrap' }}
                  data-placeholder="Write your note here..."
                />
              ) : (
                <div
                  className="text-black text-sm min-h-[4.5rem] whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: note.content || '' }}
                />
              )}
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                {editingNoteId === note.id && (
                  <>
                    {/* Removed Bold and Italic buttons */}
                  </>
                )}
                {/* Removed B / span */}
              </div>
              <button
                onClick={(e) => deleteNote(note.id, e)}
                className="text-black hover:text-red-700 text-2xl"
              >
                &#x1F5D1;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Note Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={handleNewNoteClick}
          className="bg-gray-700 text-white p-4 rounded-2xl flex flex-col items-center justify-center hover:bg-gray-600 w-48 h-48 aspect-square"
        >
          <span className="text-5xl">+</span>
          <span className="mt-2 font-jockey-one text-xl">new notebox</span>
        </button>
      </div>
    </div>
  );
}

// Wrap rendering in a try-catch to catch startup errors
try {
  const rootElement = document.getElementById('root');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = `<div style="color: white; padding: 20px;">Error: ${error.message}</div>`;
} 