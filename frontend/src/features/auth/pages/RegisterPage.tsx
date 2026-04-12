import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import type { UserRole } from '@features/auth/types';
import { User, AtSign, Briefcase } from 'lucide-react';

export const RegisterPage = () => {
	const [formData, setFormData] = useState({
		username: '',
		displayName: '',
		type: 'STUDENT' as UserRole,
	});
	const { signup, isLoading, error } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.username.trim() || !formData.displayName.trim()) return;

		const success = await signup(formData);
		if (success) {
			navigate('/');
		}
	};

	return (
		<div className="min-h-screen bg-paper flex items-center justify-center p-6">
			<div className="card w-full max-w-[420px] shadow-lg animate-fade-up">
				<div className="card-header flex-col items-center py-6 border-none">
					<h1 className="text-3xl font-serif font-semibold text-ink-1 tracking-tightest">
						Tạo tài khoản
					</h1>
					<p className="text-sm text-ink-3 mt-2">
						Bắt đầu hành trình giáo dục hiện đại
					</p>
				</div>

				<form onSubmit={handleSubmit} className="card-body space-y-4 px-8 pb-8 pt-0">
					{error && (
						<div className="p-3 bg-red-fill border border-red-border rounded text-red-text text-xs font-medium">
							{error}
						</div>
					)}

					<div className="input-wrap flex flex-col gap-1.5">
						<label className="input-label">Họ và tên</label>
						<div className="input-field">
							<User size={16} className="text-ink-3" />
							<input
								type="text"
								placeholder="Ví dụ: Nguyễn Văn An"
								value={formData.displayName}
								onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
								required
							/>
						</div>
					</div>

					<div className="input-wrap flex flex-col gap-1.5">
						<label className="input-label">Tên đăng nhập</label>
						<div className="input-field">
							<AtSign size={16} className="text-ink-3" />
							<input
								type="text"
								placeholder="Ví dụ: nva_2024"
								value={formData.username}
								onChange={(e) => setFormData({ ...formData, username: e.target.value })}
								required
							/>
						</div>
					</div>

					<div className="input-wrap flex flex-col gap-1.5">
						<label className="input-label">Vai trò</label>
						<div className="input-field py-1">
							<Briefcase size={16} className="text-ink-3" />
							<select
								className="w-full bg-transparent focus:outline-none text-ink-1 text-base h-full ml-1"
								value={formData.type}
								onChange={(e) => setFormData({ ...formData, type: e.target.value as UserRole })}
							>
								<option value="STUDENT">Học sinh</option>
								<option value="TEACHER">Giáo viên</option>
							</select>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className={`btn btn-primary w-full py-2.5 font-semibold mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
					>
						{isLoading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
					</button>

					<div className="text-center pt-4 border-t border-rule">
						<p className="text-sm text-ink-2">
							Đã có tài khoản?{' '}
							<Link to="/login" className="text-warm-400 font-semibold hover:text-warm-600 transition-colors">
								Đăng nhập
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};
