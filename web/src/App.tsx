import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { Builder } from './builder/Builder';
import { WorksheetList } from './builder/WorksheetList';
import { WorksheetRunner } from './runner/WorksheetRunner';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { LoginPage } from './auth/LoginPage';
// RunnerPage is defined below

// Protected Route Wrapper
const RequireAuth = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <div className="min-h-screen flex flex-col">
    {/* Simple Top Bar for Admin */}
    <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <a href="/" className="font-bold text-xl text-blue-600 tracking-tight">LearnTo<span className="text-gray-900">Action</span></a>
        <span className="text-gray-300">|</span>
        <nav className="flex gap-4 text-sm font-medium">
          <a href="/" className="text-gray-600 hover:text-black">Dashboard</a>
          <a href="/builder" className="text-gray-600 hover:text-black">Builder</a>
        </nav>
      </div>
      <button onClick={() => { localStorage.removeItem('user'); window.location.reload(); }} className="text-sm text-gray-500 hover:text-red-500">Sign Out</button>
    </header>
    <main className="flex-1 bg-gray-50">
      <Outlet />
    </main>
  </div>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/w/:slug" element={<RunnerPage />} />

          {/* Protected Routes (Teacher Only) */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<WorksheetList />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/analytics/:slug" element={<AnalyticsDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const RunnerPage = () => {
  const { slug } = useParams();
  if (!slug) return <div className="p-8 text-center text-red-500">Invalid Worksheet URL</div>;
  return <WorksheetRunner slug={slug} />;
};

export default App;
