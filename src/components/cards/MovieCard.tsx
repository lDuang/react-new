// path: src/components/cards/MovieCard.tsx
import React from 'react';
import { Film } from 'lucide-react';
import { Entry } from '@/types';

// 移除了 MovieLogMeta 接口的定义，因为它不再被使用。
// interface MovieLogMeta {
//   director?: string;
//   release_year?: number;
//   poster_url?: string;
//   rating?: number;
// }

interface MovieCardProps {
  data: Entry;
}

export const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  const director = data.details?.director;
  const content = data.details?.content || data.details?.review;
  
  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <Film size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
      </div>

      {director && <p className="text-sm text-sub font-medium">Director: {director}</p>}
      {content && <p className="text-sub line-clamp-3">{content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};