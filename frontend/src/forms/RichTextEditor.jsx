import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Subscript,
  Superscript,
  Underline,
} from "lucide-react";
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
} from "./formTypography";
import { normalizeRichTextValue, sanitizeRichTextHtml } from "./richTextUtils";

const COMMANDS = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  justifyLeft: "justifyLeft",
  justifyCenter: "justifyCenter",
  justifyRight: "justifyRight",
  justifyFull: "justifyFull",
  insertUnorderedList: "insertUnorderedList",
  insertOrderedList: "insertOrderedList",
  removeFormat: "removeFormat",
  superscript: "superscript",
  subscript: "subscript",
};

const ToolbarButton = ({ active = false, title, onClick, children }) => (
  <button
    type="button"
    title={title}
    aria-pressed={active}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
      active
        ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Write your description here...",
  className = "",
  minHeight = "220px",
  autoFocus = false,
}) => {
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const isEditingRef = useRef(false);
  const [currentState, setCurrentState] = useState({
    bold: false,
    italic: false,
    underline: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    superscript: false,
    subscript: false,
  });

  const syncFromDom = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const doc = editor.ownerDocument;
    setCurrentState({
      bold: doc.queryCommandState("bold"),
      italic: doc.queryCommandState("italic"),
      underline: doc.queryCommandState("underline"),
      justifyLeft: doc.queryCommandState("justifyLeft"),
      justifyCenter: doc.queryCommandState("justifyCenter"),
      justifyRight: doc.queryCommandState("justifyRight"),
      justifyFull: doc.queryCommandState("justifyFull"),
      insertUnorderedList: doc.queryCommandState("insertUnorderedList"),
      insertOrderedList: doc.queryCommandState("insertOrderedList"),
      superscript: doc.queryCommandState("superscript"),
      subscript: doc.queryCommandState("subscript"),
    });
  };

  const commitEditorHtml = (sanitize = false) => {
    const editor = editorRef.current;
    if (!editor) return "";

    const rawHtml = editor.innerHTML;
    const html = sanitize ? sanitizeRichTextHtml(rawHtml) : rawHtml;
    if (sanitize && rawHtml !== html) {
      editor.innerHTML = html;
    }
    onChange?.(html);
    return html;
  };

  const saveEditorSelection = () => {
    const selection = window.getSelection();
    const editor = editorRef.current;

    if (
      !selection ||
      selection.rangeCount === 0 ||
      !editor ||
      !editor.contains(selection.anchorNode)
    ) {
      return;
    }

    savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreEditorSelection = () => {
    const range = savedSelectionRef.current;
    const editor = editorRef.current;

    if (!range || !editor) return false;

    editor.focus();
    const selection = window.getSelection();
    if (!selection) return false;

    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const applyStyleToSelection = (style = {}) => {
    if (!restoreEditorSelection()) return;

    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || selection.rangeCount === 0 || !editor) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement("span");

    Object.entries(style).forEach(([key, nextValue]) => {
      if (nextValue) {
        span.style[key] = nextValue;
      }
    });

    if (range.collapsed) {
      span.appendChild(document.createTextNode("\u200b"));
      range.insertNode(span);

      const nextRange = document.createRange();
      nextRange.setStart(span.firstChild, 1);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    } else {
      try {
        range.surroundContents(span);
      } catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }

      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      selection.removeAllRanges();
      selection.addRange(nextRange);
    }

    commitEditorHtml(true);
    syncFromDom();
    saveEditorSelection();
  };

  const wrapSelectionWithStyle = (style = {}) => {
    applyStyleToSelection(style);
  };

  const applyTextColor = (color) => {
    if (!color) return;
    wrapSelectionWithStyle({ color });
  };

  const applyBackgroundColor = (color) => {
    if (!color) return;
    wrapSelectionWithStyle({ backgroundColor: color });
  };

  const applyFontFamily = (family) => {
    if (!family) return;
    wrapSelectionWithStyle({ fontFamily: family });
  };

  const applyFontSize = (size) => {
    if (!size) return;
    wrapSelectionWithStyle({
      fontSize: size,
    });
  };

  const executeCommand = (command, value = null) => {
    if (!restoreEditorSelection()) return;

    focusEditor();
    document.execCommand("styleWithCSS", false, true);
    document.execCommand(command, false, value);
    commitEditorHtml(true);
    syncFromDom();
    saveEditorSelection();
  };

  const insertLink = () => {
    const link = window.prompt("Enter link URL");
    if (!link) return;
    executeCommand("createLink", link);
  };

  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;

    const nextHtml = normalizeRichTextValue(value);
    if (!hasInitializedRef.current) {
      node.innerHTML = nextHtml;
      hasInitializedRef.current = true;
      return;
    }

    if (!isEditingRef.current && node.innerHTML !== nextHtml) {
      node.innerHTML = nextHtml;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus) {
      editorRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className="flex max-w-full flex-wrap items-center gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/50 p-3"
        onMouseDownCapture={saveEditorSelection}
        onPointerDownCapture={saveEditorSelection}
      >
        <select
          defaultValue=""
          onMouseDown={saveEditorSelection}
          onFocus={saveEditorSelection}
          onChange={(event) => {
            applyFontFamily(event.target.value);
            event.target.value = "";
          }}
          className="h-10 w-full min-w-[11rem] rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none sm:w-44"
        >
          <option value="">Font family</option>
          {FONT_FAMILY_OPTIONS.map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>

        <select
          defaultValue=""
          onMouseDown={saveEditorSelection}
          onFocus={saveEditorSelection}
          onChange={(event) => {
            applyFontSize(event.target.value);
            event.target.value = "";
          }}
          className="h-10 w-full min-w-[8.5rem] rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none sm:w-36"
        >
          <option value="">Font size</option>
          {FONT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="flex shrink-0 items-center gap-2">
          <label className="sr-only" htmlFor="description-text-color">
            Text color
          </label>
          <input
            id="description-text-color"
            type="color"
            title="Text color"
            onMouseDown={saveEditorSelection}
            onFocus={saveEditorSelection}
            onChange={(event) => applyTextColor(event.target.value)}
            className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
          />
          <label className="sr-only" htmlFor="description-bg-color">
            Background color
          </label>
          <input
            id="description-bg-color"
            type="color"
            title="Background color"
            onMouseDown={saveEditorSelection}
            onFocus={saveEditorSelection}
            onChange={(event) => applyBackgroundColor(event.target.value)}
            className="h-10 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
          />
        </div>

        <div className="h-8 w-px shrink-0 bg-white/10" />

        <ToolbarButton
          title="Bold"
          active={currentState.bold}
          onClick={() => executeCommand(COMMANDS.bold)}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={currentState.italic}
          onClick={() => executeCommand(COMMANDS.italic)}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={currentState.underline}
          onClick={() => executeCommand(COMMANDS.underline)}
        >
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Left"
          active={currentState.justifyLeft}
          onClick={() => executeCommand(COMMANDS.justifyLeft)}
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Center"
          active={currentState.justifyCenter}
          onClick={() => executeCommand(COMMANDS.justifyCenter)}
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Right"
          active={currentState.justifyRight}
          onClick={() => executeCommand(COMMANDS.justifyRight)}
        >
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Justify"
          active={currentState.justifyFull}
          onClick={() => executeCommand(COMMANDS.justifyFull)}
        >
          <AlignJustify size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Bulleted list"
          active={currentState.insertUnorderedList}
          onClick={() => executeCommand(COMMANDS.insertUnorderedList)}
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={currentState.insertOrderedList}
          onClick={() => executeCommand(COMMANDS.insertOrderedList)}
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Link" onClick={insertLink}>
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Superscript"
          active={currentState.superscript}
          onClick={() => executeCommand(COMMANDS.superscript)}
        >
          <Superscript size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Subscript"
          active={currentState.subscript}
          onClick={() => executeCommand(COMMANDS.subscript)}
        >
          <Subscript size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Clear formatting"
          onClick={() => executeCommand(COMMANDS.removeFormat)}
        >
          <Eraser size={15} />
        </ToolbarButton>
      </div>

      <div
        ref={editorRef}
        contentEditable
        dir="ltr"
        suppressContentEditableWarning
        onInput={() => {
          commitEditorHtml(false);
          syncFromDom();
          saveEditorSelection();
        }}
        onPaste={(event) => {
          event.preventDefault();
          const clipboard = event.clipboardData || window.clipboardData;
          const html = clipboard?.getData("text/html");
          const text = clipboard?.getData("text/plain") || "";
          const nextHtml = sanitizeRichTextHtml(html || text);
          document.execCommand("insertHTML", false, nextHtml);
          commitEditorHtml(true);
          syncFromDom();
          saveEditorSelection();
        }}
        onMouseUp={saveEditorSelection}
        onKeyUp={saveEditorSelection}
        onFocus={() => {
          isEditingRef.current = true;
          saveEditorSelection();
          syncFromDom();
        }}
        onBlur={() => {
          isEditingRef.current = false;
          commitEditorHtml(true);
          saveEditorSelection();
        }}
        data-placeholder={placeholder}
        className="public-rich-editor min-h-[220px] rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-left text-slate-100 outline-none"
        style={{
          minHeight,
          direction: "ltr",
          unicodeBidi: "normal",
          textAlign: "left",
        }}
      />
    </div>
  );
};

export default RichTextEditor;
