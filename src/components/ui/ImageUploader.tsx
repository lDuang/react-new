"use client";

import { useEffect, useState } from "react";
import { Input } from "./input";
import { api } from "@/lib/api";
import { Label } from "./label";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  initialImage?: string;
}

export const ImageUploader = ({ onUploadSuccess, initialImage }: ImageUploaderProps) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialImage);

    useEffect(() => {
        setPreviewUrl(initialImage);
    }, [initialImage]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');
        
        try {
            const data = await api.uploadImage(file);
            if (!data.success) {
                throw new Error(data.id || '上传失败，请检查文件格式或大小。');
            }
            onUploadSuccess(data.url);
            setPreviewUrl(data.url);
        } catch (err: any) {
            const errorMessage = err?.info?.message || err.message || "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <Input id="picture" type="file" onChange={handleFileChange} disabled={uploading} />
            {uploading && <p className="text-sm text-sub animate-pulse">正在上传，请稍候...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {previewUrl && (
                <div>
                    <Label>当前图片预览</Label>
                    <img src={previewUrl} alt="图片预览" className="mt-2 rounded-md border max-h-48" />
                </div>
            )}
        </div>
    );
}; 