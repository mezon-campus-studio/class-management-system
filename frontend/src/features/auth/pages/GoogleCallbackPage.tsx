import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthInternal } from "@features/auth/hooks/useAuthInternal";

export const GoogleCallbackPage = () => {
    const [searchParams] = useSearchParams();
    const { loginWithGoogle, error } = useAuthInternal();
    const navigate = useNavigate();
    const code = searchParams.get("code");

    useEffect(() => {
        const handleCallback = async () => {
            if (code) {
                const success = await loginWithGoogle(code);
                if (success) {
                    navigate("/");
                }
            } else {
                // Nếu không có code, có thể người dùng đã hủy hoặc có lỗi
                navigate("/login");
            }
        };

        handleCallback();
    }, [code, loginWithGoogle, navigate]);

    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
            <div className="w-12 h-12 border-4 border-warm-200 border-t-warm-500 rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-serif font-semibold text-ink-1">
                Đang xác thực với Google...
            </h2>
            {error && (
                <div className="mt-4 p-4 bg-ink-red-fill border border-ink-red-border rounded text-ink-red-text max-w-md text-center">
                    <p className="font-semibold">Lỗi xác thực</p>
                    <p className="text-sm mt-1">{error}</p>
                    <button 
                        onClick={() => navigate("/login")}
                        className="mt-4 btn btn-secondary py-1.5 px-4 text-sm"
                    >
                        Quay lại đăng nhập
                    </button>
                </div>
            )}
        </div>
    );
};
