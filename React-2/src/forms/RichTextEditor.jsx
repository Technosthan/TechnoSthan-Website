import { useEffect, useRef, useState } from "react";
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
} from "./formTypography";
import { normalizeRichTextValue, sanitizeRichTextHtml } from "./richTextUtils";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Eraser,
  Link as LinkIcon,
  Superscript,
  Subscript,
} from "lucide-react";

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
    className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
      active
        ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-100"
        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
    }`}
  >
    {children}
  </button>
);

const selectTarget = (editorRef) => {
  const editor = editorRef.current;
  if (!editor) return false;
  editor.focus();
  return true;
};

const applyCommand = (editorRef, command, value = null) => {
  if (!selectTarget(editorRef)) return;
  document.execCommand(command, false, value);
};

const RichTextEditor = ({
  value = "",
  onChange,
  placeholder = "Write your description here...",
  className = "",
  minHeight = "220px",
  autoFocus = false,
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
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
    if (!editorRef.current) return;
    const doc = editorRef.current.ownerDocument;
    const state = {
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
    };
    setCurrentState(state);
  };

  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;
    const nextHtml = normalizeRichTextValue(value);
    if (!isFocused && node.innerHTML !== nextHtml) {
      node.innerHTML = nextHtml;
    }
  }, [isFocused, value]);

  useEffect(() => {
    if (autoFocus) {
      editorRef.current?.focus();
    }
  }, [autoFocus]);

  const applyTextColor = (color) => {
    if (!color) return;
    applyCommand(editorRef, "foreColor", color);
    onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
  };

  const applyBackgroundColor = (color) => {
    if (!color) return;
    applyCommand(editorRef, "hiliteColor", color);
    onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
  };

  const insertLink = () => {
    const link = window.prompt("Enter link URL");
    if (!link) return;
    applyCommand(editorRef, "createLink", link);
    onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = sanitizeRichTextHtml(editorRef.current.innerHTML);
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    onChange?.(html);
    syncFromDom();
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const clipboard = event.clipboardData || window.clipboardData;
    const html = clipboard?.getData("text/html");
    const text = clipboard?.getData("text/plain") || "";
    const nextHtml = sanitizeRichTextHtml(html || text);
    document.execCommand("insertHTML", false, nextHtml);
    onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 p-3">
        <select
          defaultValue=""
          onChange={(event) => {
            const family = event.target.value;
            if (!family) return;
            applyCommand(editorRef, "fontName", family);
            onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
            event.target.value = "";
          }}
          className="h-9 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100"
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
          onChange={(event) => {
            const size = event.target.value;
            if (!size) return;
            applyCommand(editorRef, "fontSize", 7);
            if (editorRef.current) {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const span = document.createElement("span");
                span.style.fontSize = size;
                try {
                  range.surroundContents(span);
                } catch {
                  const fragment = range.extractContents();
                  span.appendChild(fragment);
                  range.insertNode(span);
                }
              }
              editorRef.current.querySelectorAll('font[size="7"]').forEach((node) => {
                const span = document.createElement("span");
                span.style.fontSize = size;
                span.innerHTML = node.innerHTML;
                node.replaceWith(span);
              });
            }
            onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
            event.target.value = "";
          }}
          className="h-9 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-100"
        >
          <option value="">Font size</option>
          {FONT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            title="Text color"
            onChange={(event) => applyTextColor(event.target.value)}
            className="h-9 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
          />
          <input
            type="color"
            title="Background color"
            onChange={(event) => applyBackgroundColor(event.target.value)}
            className="h-9 w-10 cursor-pointer rounded-xl border border-white/10 bg-transparent p-1"
          />
        </div>

        <div className="h-8 w-px bg-white/10" />

        <ToolbarButton
          title="Bold"
          active={currentState.bold}
          onClick={() => {
            applyCommand(editorRef, COMMANDS.bold);
            onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
          }}
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={currentState.italic}
          onClick={() => {
            applyCommand(editorRef, COMMANDS.italic);
            onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
          }}
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={currentState.underline}
          onClick={() => {
            applyCommand(editorRef, COMMANDS.underline);
            onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
          }}
        >
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton title="Left" active={currentState.justifyLeft} onClick={() => applyCommand(editorRef, COMMANDS.justifyLeft)}>
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton title="Center" active={currentState.justifyCenter} onClick={() => applyCommand(editorRef, COMMANDS.justifyCenter)}>
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton title="Right" active={currentState.justifyRight} onClick={() => applyCommand(editorRef, COMMANDS.justifyRight)}>
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton title="Justify" active={currentState.justifyFull} onClick={() => applyCommand(editorRef, COMMANDS.justifyFull)}>
          <AlignJustify size={15} />
        </ToolbarButton>
        <ToolbarButton title="Bulleted list" active={currentState.insertUnorderedList} onClick={() => applyCommand(editorRef, COMMANDS.insertUnorderedList)}>
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" active={currentState.insertOrderedList} onClick={() => applyCommand(editorRef, COMMANDS.insertOrderedList)}>
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton title="Link" onClick={insertLink}>
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton title="Superscript" active={currentState.superscript} onClick={() => applyCommand(editorRef, COMMANDS.superscript)}>
          <Superscript size={15} />
        </ToolbarButton>
        <ToolbarButton title="Subscript" active={currentState.subscript} onClick={() => applyCommand(editorRef, COMMANDS.subscript)}>
          <Subscript size={15} />
        </ToolbarButton>
        <ToolbarButton
          title="Clear formatting"
          onClick={() => {
            applyCommand(editorRef, COMMANDS.removeFormat);
            onChange?.(sanitizeRichTextHtml(editorRef.current?.innerHTML || ""));
          }}
        >
          <Eraser size={15} />
        </ToolbarButton>

      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        className="public-rich-editor min-h-[220px] rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-slate-100 outline-none"
        style={{ minHeight }}
        dangerouslySetInnerHTML={{ __html: normalizeRichTextValue(value) }}
      />
    </div>
  );
};

export default RichTextEditor;
