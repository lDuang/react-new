import React from 'react';
import { FileText } from 'lucide-react';
import { Entry } from '@/types'; // Import the main Entry type

// A helper function to intelligently generate a brief excerpt from any entry type.
const getEntryExcerpt = (entry: Entry): string => {
  if (!entry.details) return '';

  const { details, type } = entry;
  let rawContent = '';

  // Prioritize content fields based on the entry type
  switch (type) {
    case 'BLOG_POST':
      rawContent = details.full_content || '';
      break;
    case 'NOTE':
      rawContent = details.note_content || '';
      break;
    case 'BOOK_LOG':
      rawContent = details.reading_notes || details.review || '';
      break;
    case 'MOVIE_LOG':
      rawContent = details.review || '';
      break;
    case 'CODE_CHALLENGE':
        rawContent = details.notes || details.my_solution || '';
        break;
    case 'PHOTOGRAPH':
        rawContent = details.description || '';
        break;
    default:
        // A generic fallback for any other types or legacy data
        rawContent = details.content || details.full_content || details.note_content || '';
  }
  
  // Strip markdown for a cleaner preview and limit length
  const plainText = rawContent.replace(/#+\s/g, '').replace(/(\*|_|`)/g, '');
  return plainText.length > 100 ? `${plainText.substring(0, 100)}...` : plainText;
};

// The Card now receives the standard Entry object
interface DefaultCardProps {
  data: Entry;
}

export const DefaultCard: React.FC<DefaultCardProps> = ({ data }) => {
  // Use the helper function to get a smart excerpt
  const displayContent = getEntryExcerpt(data);

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