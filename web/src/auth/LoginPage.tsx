import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "./AuthProvider";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            const res = await api.post('/auth/login', { email, password });
            // @ts-ignore
            if (res.success) {
                // @ts-ignore
                login(res.token, res.user);

                // Redirect logic
                // @ts-ignore
                const from = location.state?.from?.pathname || "/builder";
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            console.error(err);
            const serverMsg = err.response?.data?.message || err.message;
            setError(serverMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = email.length > 0 && password.length > 0;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Soft Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 pointer-events-none" />

            {/* Decorative Patterns */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            <div className="max-w-[400px] w-full relative z-10">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-200">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">LearnToAction</h1>
                    <p className="text-gray-500 mt-2 text-sm">Turn your learning into action.</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">Email</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 active:scale-[0.98]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Demo Access Info */}
                    <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
                        <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Demo Credentials</p>
                        <div className="inline-flex flex-col items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                            <code className="text-xs text-gray-600 font-mono">admin@learntoaction.com</code>
                            <div className="w-full h-px bg-gray-100 my-1"></div>
                            <code className="text-xs text-gray-600 font-mono">password</code>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-sm text-gray-400">
                    &copy; 2026 LearnToAction Labs.
                </p>
            </div>
        </div>
    );
};
