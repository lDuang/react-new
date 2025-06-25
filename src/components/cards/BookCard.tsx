// path: src/components/cards/BookCard.tsx
import React from 'react';
import { BookOpenText } from 'lucide-react';
import { Entry } from '@/types';

// interface BookLogMeta { // BookLogMeta 不再被使用，已移除
//   author?: string;
//   cover_url?: string;
//   rating?: number;
//   url?: string;
// }

export interface BookCardData {
  id: string;
  type: "BOOK_LOG";
  title: string;
  content: string;
  is_public: 0 | 1;
  created_at: number;
  meta: string;
  tags?: string[];
}

interface BookCardProps {
  data: Entry;
}

export const BookCard: React.FC<BookCardProps> = ({ data }) => {
  const author = data.details?.author;
  const content = data.details?.content || data.details?.review;

  // metaData 不再被使用，已移除其计算逻辑
  // const metaData: BookLogMeta = React.useMemo(() => {
  //   try {
  //     return JSON.parse(data.meta || '{}');
  //   } catch (_e) { // 将未使用的 e 重命名为 _e
  //     return {};
  //   }
  // }, [data.meta]);

  // const handleLinkClick = (/*e: React.MouseEvent*/) => {
  //   // e.stopPropagation();
  //   // window.open(data.meta.url, '_blank', 'noopener,noreferrer');
  // };

  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <BookOpenText size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
      </div>
      
      {author && <p className="text-sm text-sub font-medium">by {author}</p>}
      {content && <p className="text-sub line-clamp-3">{content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};