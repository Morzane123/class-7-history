"use client";

import { useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormat = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbar = [
    { label: "B", title: "粗体", action: () => insertFormat("**", "**") },
    { label: "I", title: "斜体", action: () => insertFormat("*", "*") },
    { label: "U", title: "下划线", action: () => insertFormat("<u>", "</u>") },
    { label: "S", title: "删除线", action: () => insertFormat("~~", "~~") },
    { label: "H", title: "标题", action: () => insertFormat("## ") },
    { label: "•", title: "列表", action: () => insertFormat("- ") },
    { label: "1.", title: "编号", action: () => insertFormat("1. ") },
    { label: "「」", title: "引用", action: () => insertFormat("> ") },
    { label: "链接", title: "链接", action: () => insertFormat("[", "](url)") },
  ];

  return (
    <div className="border border-[#d2d2d7] rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 bg-[#f5f5f7] border-b border-[#d2d2d7] flex-wrap">
        {toolbar.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={item.action}
            className="w-8 h-8 flex items-center justify-center text-sm font-medium text-[#1d1d1f] hover:bg-white rounded transition-colors"
            title={item.title}
          >
            {item.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-4 resize-y focus:outline-none text-[#1d1d1f]"
        rows={8}
      />
      <div className="p-2 bg-[#f5f5f7] border-t border-[#d2d2d7] text-xs text-[#86868b]">
        支持 Markdown 格式：**粗体** *斜体* ~~删除线~~ ## 标题 - 列表
      </div>
    </div>
  );
}
