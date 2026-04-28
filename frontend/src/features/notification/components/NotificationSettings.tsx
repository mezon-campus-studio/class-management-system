import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { notificationApi } from '../api';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationPreferences, ChatLevel, PreferenceEntry } from '../types';

const defaultGlobal: PreferenceEntry = {
  classroomId: null,
  chatLevel: 'ALL',
  dutyEnabled: true,
  eventEnabled: true,
  attendanceEnabled: true,
  fundEnabled: true,
  evaluationEnabled: true,
};

const defaultPrefs: NotificationPreferences = {
  global: defaultGlobal,
  classrooms: [],
};

interface Props {
  onClose: () => void;
}

export function NotificationSettings({ onClose }: Props) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    notificationApi.getPreferences().then((p) => {
      setPrefs(p);
    }).catch(() => {
      setPrefs(defaultPrefs);
    }).finally(() => setLoading(false));
  }, []);

  const setGlobal = (patch: Partial<PreferenceEntry>) => {
    setPrefs((prev) => ({ ...prev, global: { ...prev.global, ...patch } }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await notificationApi.updatePreferences(prefs);
      useNotificationStore.setState({ globalChatLevel: updated.global.chatLevel });
      onClose();
    } catch {
      setError('Không lưu được cài đặt. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const chatLevelOptions: { value: ChatLevel; label: string }[] = [
    { value: 'ALL', label: 'Tất cả' },
    { value: 'MENTIONS_ONLY', label: 'Chỉ khi được nhắc tên' },
    { value: 'NOTHING', label: 'Tắt' },
  ];

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid var(--rule)' }}
        >
          <p className="font-semibold text-ink-1">Cài đặt thông báo</p>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-ink-3 animate-pulse">Đang tải...</div>
        ) : (
          <div className="p-5 space-y-6">
            {error && (
              <div
                className="p-2 text-xs rounded"
                style={{ background: 'var(--red-fill)', color: 'var(--red-text)' }}
              >
                {error}
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">
                Tin nhắn
              </p>
              <div>
                <label className="text-label mb-2 block">Thông báo chat</label>
                <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--rule)' }}>
                  {chatLevelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setGlobal({ chatLevel: opt.value })}
                      className="flex-1 py-2 text-xs font-medium transition-colors"
                      style={
                        prefs.global.chatLevel === opt.value
                          ? {
                              background: 'var(--sidebar-accent)',
                              color: '#fff',
                            }
                          : {
                              background: 'transparent',
                              color: 'var(--ink-2)',
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 mb-3">
                Các thông báo khác
              </p>
              <div className="space-y-3">
                {[
                  { key: 'dutyEnabled' as const, label: 'Trực nhật' },
                  { key: 'eventEnabled' as const, label: 'Sự kiện' },
                  { key: 'attendanceEnabled' as const, label: 'Điểm danh' },
                  { key: 'fundEnabled' as const, label: 'Quỹ lớp' },
                  { key: 'evaluationEnabled' as const, label: 'Học sinh tiêu biểu' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-ink-1">{label}</span>
                    <button
                      role="switch"
                      aria-checked={prefs.global[key]}
                      onClick={() => setGlobal({ [key]: !prefs.global[key] })}
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0"
                      style={{
                        background: prefs.global[key] ? 'var(--sidebar-accent)' : 'var(--rule)',
                      }}
                    >
                      <span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                        style={{
                          transform: prefs.global[key] ? 'translateX(18px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </label>
                ))}
              </div>
              <p className="text-xs text-ink-3 mt-3">
                Đây là cài đặt mặc định. Bạn có thể ghi đè theo từng lớp học riêng.
              </p>
            </div>
          </div>
        )}

        <div
          className="px-5 py-3 flex justify-end gap-2"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          <button onClick={onClose} className="btn btn-ghost btn-sm">Hủy</button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="btn btn-primary btn-sm"
          >
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
