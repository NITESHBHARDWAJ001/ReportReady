import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAppStore } from '@/store/useAppStore'

// Lazy-load heavy feature pages to keep initial bundle small
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const UploadPage = lazy(() => import('@/features/upload/UploadPage'))
const FormatCheckerPage = lazy(() => import('@/features/format-checker/FormatCheckerPage'))
const CoverGeneratorPage = lazy(() => import('@/features/cover-generator/CoverGeneratorPage'))
const CertificatePage = lazy(() => import('@/features/certificate/CertificatePage'))
const DeclarationPage = lazy(() => import('@/features/declaration/DeclarationPage'))
const ReferencesPage = lazy(() => import('@/features/references/ReferencesPage'))
const ExportPage = lazy(() => import('@/features/export/ExportPage'))
const FormatRequirementsPage = lazy(() => import('@/features/format-requirements/FormatRequirementsPage'))

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  const { darkMode } = useAppStore()

  // Apply dark mode on mount and whenever it changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/upload"
            element={
              <Suspense fallback={<PageLoader />}>
                <UploadPage />
              </Suspense>
            }
          />
          <Route
            path="/format-requirements"
            element={
              <Suspense fallback={<PageLoader />}>
                <FormatRequirementsPage />
              </Suspense>
            }
          />
          <Route
            path="/format-checker"
            element={
              <Suspense fallback={<PageLoader />}>
                <FormatCheckerPage />
              </Suspense>
            }
          />
          <Route
            path="/cover-generator"
            element={
              <Suspense fallback={<PageLoader />}>
                <CoverGeneratorPage />
              </Suspense>
            }
          />
          <Route
            path="/certificate"
            element={
              <Suspense fallback={<PageLoader />}>
                <CertificatePage />
              </Suspense>
            }
          />
          <Route
            path="/declaration"
            element={
              <Suspense fallback={<PageLoader />}>
                <DeclarationPage />
              </Suspense>
            }
          />
          <Route
            path="/references"
            element={
              <Suspense fallback={<PageLoader />}>
                <ReferencesPage />
              </Suspense>
            }
          />
          <Route
            path="/export"
            element={
              <Suspense fallback={<PageLoader />}>
                <ExportPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
