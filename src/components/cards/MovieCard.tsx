// path: src/components/cards/MovieCard.tsx
import React from 'react';
import { Film } from 'lucide-react';

// 移除了 MovieLogMeta 接口的定义，因为它不再被使用。
// interface MovieLogMeta {
//   director?: string;
//   release_year?: number;
//   poster_url?: string;
//   rating?: number;
// }

export interface MovieCardData {
  id: string;
  type: "MOVIE_LOG";
  title: string;
  content: string;
  is_public: 0 | 1;
  created_at: number;
  meta: string; // 仍然保留 meta 字段在接口中，因为它来自数据
  tags?: string[];
}

interface MovieCardProps {
  data: MovieCardData;
}

export const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  // _metaData 变量的声明和解析逻辑已在上次修复中移除。

  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <Film size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
      </div>

      {data.content && <p className="text-sub line-clamp-3">{data.content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};