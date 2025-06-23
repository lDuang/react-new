// path: src/components/cards/LeetcodeCard.tsx
import React from 'react';
import { Code2 } from 'lucide-react';

interface LeetcodeSubmissionMeta {
  problem_title?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  submission_url?: string;
  language?: string;
  slug?: string;
}

export interface LeetcodeCardData {
  id: string;
  type: "LEETCODE_SUBMISSION";
  title: string;
  content: string;
  is_public: 0 | 1;
  created_at: number;
  meta: string;
  tags?: string[];
}

interface LeetcodeCardProps {
  data: LeetcodeCardData;
}

const difficultyClass = (difficulty: 'Easy' | 'Medium' | 'Hard' | undefined) => {
  switch (difficulty) {
    case 'Easy':
      return 'text-green-400';
    case 'Medium':
      return 'text-yellow-400';
    case 'Hard':
      return 'text-red-400';
    default:
      return 'text-sub';
  }
};

export const LeetcodeCard: React.FC<LeetcodeCardProps> = ({ data }) => {
  const metaData: LeetcodeSubmissionMeta = React.useMemo(() => {
    try {
      return JSON.parse(data.meta || '{}');
    } catch { // 直接移除未使用的 'e' 或 '_e'
      return {};
    }
  }, [data.meta]);

  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <Code2 size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
        {metaData?.difficulty && (
            <span className={`text-xs font-bold ${difficultyClass(metaData.difficulty)}`}>
                ({metaData.difficulty})
            </span>
        )}
      </div>
      
      {data.content && <p className="text-sub line-clamp-3">{data.content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};