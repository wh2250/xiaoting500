"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { submitTaskAction } from "@/actions/submissions";
import { timeLabel } from "@/lib/date";
import type { Submission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PhotoGrid } from "@/components/photo-grid";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 6;

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
}

interface SubmissionSectionProps {
  existing: Submission | null;
}

/** 学生端：拍照 → 压缩 → 上传 → 已提交状态 */
export function SubmissionSection({ existing }: SubmissionSectionProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(!existing);
  const [items, setItems] = useState<PhotoItem[]>([]);
  const [note, setNote] = useState(existing?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [pending, startTransition] = useTransition();

  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // 离开页面时释放预览图的内存
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const incoming = Array.from(fileList);
    const remaining = MAX_PHOTOS - items.length;
    if (remaining <= 0) {
      setError(`最多上传 ${MAX_PHOTOS} 张照片哦`);
      return;
    }
    if (incoming.length > remaining) {
      setError(`最多上传 ${MAX_PHOTOS} 张，多出来的先不收啦`);
    }

    setCompressing(true);
    try {
      const compressed = await Promise.all(incoming.slice(0, remaining).map(compressImage));
      const nextItems = compressed.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
      setItems((prev) => [...prev, ...nextItems]);
    } catch {
      setError("这张照片处理失败了，换一张试试吧");
    } finally {
      setCompressing(false);
      if (cameraRef.current) cameraRef.current.value = "";
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  function removePhoto(id: string) {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.id !== id);
    });
  }

  function handleSubmit() {
    if (items.length === 0) {
      setError("先拍一张作业照片吧～");
      return;
    }
    setError(null);

    const formData = new FormData();
    items.forEach((item) => formData.append("photos", item.file));
    formData.append("note", note);

    startTransition(async () => {
      const result = await submitTaskAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      items.forEach((item) => URL.revokeObjectURL(item.preview));
      setItems([]);
      setEditing(false);
      router.refresh();
    });
  }

  /* ---------------- 已提交 ---------------- */
  if (existing && !editing) {
    return (
      <Card className="animate-fade-up">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-soft text-sage-deep">
              <Check className="h-4 w-4" strokeWidth={2.6} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-foreground">已提交</p>
              <p className="text-2xs text-muted">
                {timeLabel(existing.submitted_at)} 提交 · {existing.image_urls.length} 张照片
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
            重新提交
          </Button>
        </div>

        <div className="mt-4">
          <PhotoGrid images={existing.image_urls} columns={3} />
        </div>

        {existing.note && (
          <p className="mt-3 rounded-[14px] bg-background px-4 py-3 text-[13px] leading-relaxed text-muted">
            “{existing.note}”
          </p>
        )}
      </Card>
    );
  }

  /* ---------------- 上传区 ---------------- */
  return (
    <Card className="animate-fade-up">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-muted">
            交作业
          </p>
          <h2 className="mt-1 text-[17px] font-semibold">拍照上传</h2>
        </div>
        <span className="text-2xs text-muted">最多 {MAX_PHOTOS} 张</span>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />

      {items.length === 0 ? (
        <div className="mt-4 rounded-card border border-dashed border-coral/40 bg-coral-soft/50 px-4 py-6 text-center">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            disabled={compressing}
            className="tap flex w-full flex-col items-center gap-2.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-coral-deep shadow-soft">
              {compressing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" strokeWidth={1.8} />
              )}
            </span>
            <span className="text-[14px] font-medium text-foreground">拍一张今天的作业</span>
            <span className="text-2xs text-muted">拍得清楚一点，他一眼就能看懂</span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            disabled={compressing}
            className="mt-3 inline-flex items-center gap-1.5 text-2xs text-coral-deep"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            从相册里选（可多选）
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-3 gap-2.5">
            {items.map((item) => (
              <div key={item.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.preview}
                  alt="待上传照片"
                  className="aspect-square w-full rounded-[14px] border border-line/60 object-cover"
                />
                <button
                  type="button"
                  aria-label="删除这张照片"
                  onClick={() => removePhoto(item.id)}
                  className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border border-line bg-white text-muted shadow-soft"
                >
                  <X className="h-3 w-3" strokeWidth={2.4} />
                </button>
              </div>
            ))}
            {items.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={compressing}
                className="tap grid aspect-square w-full place-items-center rounded-[14px] border border-dashed border-line bg-background text-muted"
                aria-label="继续添加照片"
              >
                {compressing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" strokeWidth={1.8} />
                )}
              </button>
            )}
          </div>
          <p className="mt-2 text-2xs text-muted">
            已选 {items.length} / {MAX_PHOTOS} 张，点右上角可以删掉重拍
          </p>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="submission-note" className="mb-2 block text-[13px] text-muted">
          想说的话（可选）
        </label>
        <Textarea
          id="submission-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={300}
          placeholder="今天读得有点吃力，但坚持写完啦～"
          className="min-h-[76px] bg-background"
        />
      </div>

      {error && <p className="mt-3 text-[13px] text-coral-deep">{error}</p>}

      <div className="mt-4 flex items-center gap-2.5">
        {existing && (
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
            disabled={pending}
          >
            取消
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={pending || compressing || items.length === 0}
          className={cn("flex-1")}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              上传中…
            </>
          ) : existing ? (
            "重新提交作业"
          ) : (
            "提交作业"
          )}
        </Button>
      </div>
    </Card>
  );
}

/** 用 canvas 压缩到最长边 1440px，减少上传时间和流量（Vercel 单次请求体有限制） */
async function compressImage(file: File): Promise<File> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const maxSide = 1440;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.78),
    );
    if (!blob) throw new Error("compress failed");

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
