"use client";

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Entry } from '@/types';
import { getEntryTypeDetails } from '@/config/entryTypes';
import { ArrowLeft, Calendar, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: response, error, isLoading } = useSWR(
    id ? `content_detail_${id}` : null,
    () => api.public.getContentDetail(id),
    { revalidateOnFocus: false }
  );

  const entry: Entry | undefined = response?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">无法加载内容</h2>
        <p className="text-muted-foreground mb-6">
          抱歉，我们找不到您所请求的文章。它可能已被删除或链接已失效。
        </p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 返回
        </Button>
      </div>
    );
  }
  
  const typeDetails = getEntryTypeDetails(entry.type as any); // Simple lookup
  const Icon = typeDetails?.icon;

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
       <Button variant="ghost" onClick={() => router.back()} className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
      </Button>
      <article className="prose dark:prose-invert lg:prose-xl mx-auto">
        <header className="mb-12">
            <div className="flex items-center text-muted-foreground text-lg mb-4">
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                <span>{typeDetails?.label || entry.type}</span>
            </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{entry.title}</h1>
          <div className="flex items-center text-muted-foreground space-x-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{new Date(entry.created_at * 1000).toLocaleDateString()}</span>
            </div>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex items-center">
                <TagIcon className="mr-2 h-4 w-4" />
                <span>{entry.tags.map(t => t.name).join(', ')}</span>
              </div>
            )}
          </div>
        </header>

        {entry.details?.cover_image_url && (
            <div className="my-8">
                <img src={entry.details.cover_image_url} alt={`${entry.title} a海报`} className="rounded-lg shadow-lg w-full" />
            </div>
        )}

        {entry.details?.full_content && (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {entry.details.full_content}
            </ReactMarkdown>
        )}
      </article>
    </div>
  );
}

export default EntryDetailPage; 