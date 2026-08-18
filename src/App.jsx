import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


/* ============================================================
 * ADMIN LAYOUT & AUTH
 * ============================================================
 */

import AdminLayout
  from "./layouts/AdminLayout";

import ProtectedAdminRoute
  from "./components/ProtectedAdminRoute";


/* ============================================================
 * ADMIN PAGES
 * ============================================================
 */

import Admin
  from "./pages/Admin";

import AdminParticipants
  from "./pages/AdminParticipants";

import AdminParticipant
  from "./pages/AdminParticipant";

import AdminChallenge
  from "./pages/AdminChallenge";

import AdminSettings
  from "./pages/AdminSettings";

import Ranking
  from "./pages/Ranking";

import AdminLogin
  from "./pages/AdminLogin";


/* ============================================================
 * TEAM ANALYSIS
 * ============================================================
 */

import AdminTeamAnalysis
  from "./pages/AdminTeamAnalysis";


/* ============================================================
 * TEAM AI
 * ============================================================
 */

import AdminTeamAIAnalysis
  from "./pages/AdminTeamAIAnalysis";

import AdminTeamAIScore
  from "./pages/AdminTeamAIScore";

import AdminTeamAIStrength
  from "./pages/AdminTeamAIStrength";

import AdminTeamAILeadership
  from "./pages/AdminTeamAILeadership";

import AdminTeamAITalent
  from "./pages/AdminTeamAITalent";

import AdminTeamAIGap
  from "./pages/AdminTeamAIGap";

import AdminTeamAIStructure
  from "./pages/AdminTeamAIStructure";

import AdminTeamAIInsight
  from "./pages/AdminTeamAIInsight";

import AdminTeamAIRisks
  from "./pages/AdminTeamAIRisks";

import AdminTeamAIAction
  from "./pages/AdminTeamAIAction";

import AdminTeamAIPriorityAction
  from "./pages/AdminTeamAIPriorityAction";


/* ============================================================
 * PESERTA
 * ============================================================
 */

import Login
  from "./pages/Login";

import Assessment
  from "./pages/Assessment";

import Result
  from "./pages/Result";


/* ============================================================
 * APP
 * ============================================================
 */

export default function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ====================================================
         * ROOT
         * ====================================================
         */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* ====================================================
         * LOGIN PESERTA
         * ====================================================
         */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* ====================================================
         * ASSESSMENT PESERTA
         * ====================================================
         */}

        <Route
          path="/assessment/:type"
          element={
            <Assessment />
          }
        />


        {/* ====================================================
         * RESULT PESERTA
         * ====================================================
         */}

        <Route
          path="/result"
          element={
            <Result />
          }
        />


        {/* ====================================================
         * LOGIN ADMIN
         * ====================================================
         */}

        <Route
          path="/admin/login"
          element={
            <AdminLogin />
          }
        />


        {/* ====================================================
         * ADMIN PROTECTED AREA
         * ====================================================
         *
         * Semua halaman /admin berada di bawah:
         *
         * ProtectedAdminRoute
         *        ↓
         * AdminLayout
         *
         * ====================================================
         */}

        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute />
          }
        >

          <Route
            element={
              <AdminLayout />
            }
          >


            {/* ==================================================
             * ADMIN DASHBOARD
             * ==================================================
             */}

            <Route
              index
              element={
                <Admin />
              }
            />


            {/* ==================================================
             * ADMIN CHALLENGE
             * ==================================================
             */}

            <Route
              path="challenge"
              element={
                <AdminChallenge />
              }
            />


            {/* ==================================================
             * ADMIN RANKING
             * ==================================================
             */}

            <Route
              path="ranking"
              element={
                <Ranking />
              }
            />


            {/* ==================================================
             * ADMIN TEAM ANALYSIS
             * ==================================================
             */}

            <Route
              path="analisis-tim"
              element={
                <AdminTeamAnalysis />
              }
            />


            {/* ==================================================
             * TEAM AI — EXECUTIVE SUMMARY
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai"
              element={
                <AdminTeamAIAnalysis />
              }
            />


            {/* ==================================================
             * TEAM AI — SCORE
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/score"
              element={
                <AdminTeamAIScore />
              }
            />


            {/* ==================================================
             * TEAM AI — KEKUATAN
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/strength"
              element={
                <AdminTeamAIStrength />
              }
            />


            {/* ==================================================
             * TEAM AI — LEADERSHIP
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/leadership"
              element={
                <AdminTeamAILeadership />
              }
            />


            {/* ==================================================
             * TEAM AI — TALENT MAPPING
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/talent"
              element={
                <AdminTeamAITalent />
              }
            />


            {/* ==================================================
             * TEAM AI — GAP TIM
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/gap"
              element={
                <AdminTeamAIGap />
              }
            />


            {/* ==================================================
             * TEAM AI — STRUKTUR
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/structure"
              element={
                <AdminTeamAIStructure />
              }
            />


            {/* ==================================================
             * TEAM AI — INSIGHT AI
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/insight"
              element={
                <AdminTeamAIInsight />
              }
            />


            {/* ==================================================
             * TEAM AI — TEAM RISKS
             * ==================================================
             *
             * Jangan gunakan:
             * /admin/...
             *
             * karena kita sudah berada di:
             * /admin
             *
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/risks"
              element={
                <AdminTeamAIRisks />
              }
            />


            {/* ==================================================
             * TEAM AI — PEMBINAAN
             * ==================================================
             *
             * Halaman:
             * AdminTeamAIAction.jsx
             *
             * URL:
             * /admin/analisis-tim/ai/development
             *
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/development"
              element={
                <AdminTeamAIAction />
              }
            />


            {/* ==================================================
             * TEAM AI — PRIORITY ACTION PLAN
             * ==================================================
             *
             * Halaman:
             * AdminTeamAIPriorityAction.jsx
             *
             * URL:
             * /admin/analisis-tim/ai/action
             *
             * ==================================================
             */}

            <Route
              path="analisis-tim/ai/action"
              element={
                <AdminTeamAIPriorityAction />
              }
            />


            {/* ==================================================
             * ADMIN SETTINGS
             * ==================================================
             */}

            <Route
              path="settings"
              element={
                <AdminSettings />
              }
            />


            {/* ==================================================
             * DATA PESERTA
             * ==================================================
             */}

            <Route
              path="peserta"
              element={
                <AdminParticipants />
              }
            />


            {/* ==================================================
             * DETAIL PESERTA
             * ==================================================
             */}

            <Route
              path="peserta/:participantId"
              element={
                <AdminParticipant />
              }
            />


          </Route>

        </Route>


        {/* ====================================================
         * FALLBACK
         * ====================================================
         *
         * URL yang benar-benar tidak dikenal
         * akan kembali ke login peserta.
         *
         * ====================================================
         */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


      </Routes>

    </BrowserRouter>

  );

}