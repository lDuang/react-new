// path: src/components/cards/LeetcodeCard.tsx
import React from 'react';
import { Code2 } from 'lucide-react';
import { Entry } from '@/types';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface LeetcodeCardProps {
  data: Entry;
}

const difficultyClass = (difficulty: Difficulty | undefined) => {
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
  const difficulty = data.details?.difficulty as Difficulty | undefined;
  const content = data.details?.content || data.details?.notes;

  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <Code2 size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
        {difficulty && (
            <span className={`text-xs font-bold ${difficultyClass(difficulty)}`}>
                ({difficulty})
            </span>
        )}
      </div>
      
      {content && <p className="text-sub line-clamp-3">{content}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};