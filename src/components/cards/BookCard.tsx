import React from 'react';
import { BookOpenText } from 'lucide-react';

interface BookLogMeta {
  author?: string;
  cover_url?: string;
  rating?: number;
}

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
  data: BookCardData;
}

export const BookCard: React.FC<BookCardProps> = ({ data }) => {
  const metaData: BookLogMeta = React.useMemo(() => {
    try {
      return JSON.parse(data.meta || '{}');
    } catch (e) {
      return {};
    }
  }, [data.meta]);

  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <BookOpenText size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
      </div>
      
      {data.content && <p className="text-sub line-clamp-3">{data.content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
}; 