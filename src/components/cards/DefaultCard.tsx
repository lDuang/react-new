import React from 'react';
import { FileText } from 'lucide-react';
import { Entry } from '@/types'; // Import the main Entry type

// The Card now receives the standard Entry object
interface DefaultCardProps {
  data: Entry;
}

export const DefaultCard: React.FC<DefaultCardProps> = ({ data }) => {
  // Try to get some content from details if it exists
  const displayContent = data.details?.content || data.details?.full_content || '';

  return (
    <article className="space-y-3">
      <div className="flex items-center space-x-2 text-sub">
        <FileText size={18} />
        <h3 className="text-lg font-bold text-main truncate">{data.title}</h3>
      </div>
      
      {displayContent && <p className="text-sub line-clamp-3">{displayContent}</p>}

      <div className="text-xs text-sub/80">
        创建于: {new Date(data.created_at * 1000).toLocaleDateString()}
      </div>
    </article>
  );
};