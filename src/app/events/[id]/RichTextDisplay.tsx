"use client";

interface RichTextDisplayProps {
  content: string;
}

export default function RichTextDisplay({ content }: RichTextDisplayProps) {
  const parseMarkdown = (text: string): string => {
    let html = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/^## (.+)$/gm, "<h2 class='text-2xl font-semibold text-[#1d1d1f] mt-6 mb-4'>$1</h2>")
      .replace(/^### (.+)$/gm, "<h3 class='text-xl font-semibold text-[#1d1d1f] mt-4 mb-3'>$1</h3>")
      .replace(/^- (.+)$/gm, "<li class='ml-4 text-[#1d1d1f]'>$1</li>")
      .replace(/^> (.+)$/gm, "<blockquote class='border-l-4 border-[#0071e3] pl-4 my-4 text-[#6e6e73] italic'>$1</blockquote>")
      .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-[#0071e3] hover:underline' target='_blank' rel='noopener noreferrer'>$1</a>")
      .replace(/<u>(.+?)<\/u>/g, "<u class='underline'>$1</u>")
      .replace(/\n\n/g, "</p><p class='text-[#1d1d1f] leading-relaxed mb-4'>")
      .replace(/\n/g, "<br />");

    html = `<p class='text-[#1d1d1f] leading-relaxed mb-4'>${html}</p>`;
    
    return html;
  };

  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
}
