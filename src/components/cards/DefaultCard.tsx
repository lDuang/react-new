import React from 'react';
import { FileText } from 'lucide-react';

export interface DefaultCardData {
  id: string;
  type: string; // 可以是 JOURNAL 或其他未明确定义的类型
  title: string;
  content?: string; // 泛型内容，现在是可选的
  is_public: 0 | 1;
  created_at: number;
  meta: string; // meta is a JSON string
  tags?: string[];
}

interface DefaultCardProps {
  data: DefaultCardData;
}

export const DefaultCard: React.FC<DefaultCardProps> = ({ data }) => {
  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <FileText size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
      </div>
      
      {data.content && <p className="text-sub line-clamp-3">{data.content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};