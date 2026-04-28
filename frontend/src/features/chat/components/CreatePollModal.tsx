import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { eventApi } from '@/features/event/api';
import type { Poll } from '@/features/event/types';

interface Props {
  classroomId: string;
  onClose: () => void;
  onCreated: (poll: Poll) => void;
}

export function CreatePollModal({ classroomId, onClose, onCreated }: Props) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [multiChoice, setMultiChoice] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [closesAt, setClosesAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validOptions = options.map((o) => o.trim()).filter(Boolean);
  const canSubmit = question.trim().length > 0 && validOptions.length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      const poll = await eventApi.createPoll(classroomId, {
        question: question.trim(),
        multiChoice,
        anonymous,
        options: validOptions,
        closesAt: closesAt ? new Date(closesAt).toISOString() : undefined,
      });
      onCreated(poll);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Không tạo được bình chọn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--rule)' }}>
          <p className="font-semibold text-ink-1">Tạo bình chọn</p>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="p-2 text-xs rounded"
                         style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>{error}</div>}

          <div>
            <label className="text-label mb-1 block">Câu hỏi *</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)}
                   placeholder="VD: Đi pícnic vào ngày nào?"
                   className="input-field w-full" />
          </div>

          <div>
            <label className="text-label mb-1 block">Tùy chọn *</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opt}
                         onChange={(e) => setOptions((prev) => prev.map((p, j) => j === i ? e.target.value : p))}
                         placeholder={`Tùy chọn ${i + 1}`}
                         className="input-field flex-1" />
                  {options.length > 2 && (
                    <button onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                            className="btn btn-ghost btn-icon"><Minus size={14} /></button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <button onClick={() => setOptions((prev) => [...prev, ''])}
                        className="btn btn-ghost btn-sm gap-1.5">
                  <Plus size={13} /> Thêm tùy chọn
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={multiChoice}
                     onChange={(e) => setMultiChoice(e.target.checked)} />
              Cho phép chọn nhiều
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={anonymous}
                     onChange={(e) => setAnonymous(e.target.checked)} />
              Bỏ phiếu kín
            </label>
          </div>

          <div>
            <label className="text-label mb-1 block">Thời hạn (tùy chọn)</label>
            <input type="datetime-local" value={closesAt}
                   onChange={(e) => setClosesAt(e.target.value)}
                   className="input-field w-full" />
          </div>
        </div>

        <div className="px-5 py-3 border-t flex justify-end gap-2" style={{ borderColor: 'var(--rule)' }}>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Hủy</button>
          <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn btn-primary btn-sm">
            {submitting ? 'Đang tạo...' : 'Tạo & gửi'}
          </button>
        </div>
      </div>
    </div>
  );
}
