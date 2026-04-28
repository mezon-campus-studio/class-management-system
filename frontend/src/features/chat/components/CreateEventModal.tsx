import { useState } from 'react';
import { X } from 'lucide-react';
import { eventApi } from '@/features/event/api';
import type { ClassEvent } from '@/features/event/types';

interface Props {
  classroomId: string;
  onClose: () => void;
  onCreated: (event: ClassEvent) => void;
}

export function CreateEventModal({ classroomId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    title: '', description: '', startTime: '', endTime: '',
    location: '', mandatory: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = form.title.trim().length > 0 && form.startTime.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      const event = await eventApi.createEvent(classroomId, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        startTime: new Date(form.startTime).toISOString(),
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
        location: form.location.trim() || undefined,
        mandatory: form.mandatory,
      });
      onCreated(event);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Không tạo được sự kiện');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--rule)' }}>
          <p className="font-semibold text-ink-1">Tạo sự kiện</p>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <div className="p-2 text-xs rounded"
                         style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}>{error}</div>}

          <div>
            <label className="text-label mb-1 block">Tiêu đề *</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                   placeholder="VD: Họp lớp cuối học kỳ"
                   className="input-field w-full" />
          </div>

          <div>
            <label className="text-label mb-1 block">Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2} className="input-field w-full" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-label mb-1 block">Bắt đầu *</label>
              <input type="datetime-local" value={form.startTime}
                     onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                     className="input-field w-full" />
            </div>
            <div>
              <label className="text-label mb-1 block">Kết thúc</label>
              <input type="datetime-local" value={form.endTime}
                     onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                     className="input-field w-full" />
            </div>
          </div>

          <div>
            <label className="text-label mb-1 block">Địa điểm</label>
            <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                   placeholder="VD: Phòng A1.05"
                   className="input-field w-full" />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.mandatory}
                   onChange={(e) => setForm((p) => ({ ...p, mandatory: e.target.checked }))} />
            Sự kiện bắt buộc tham gia
          </label>
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
