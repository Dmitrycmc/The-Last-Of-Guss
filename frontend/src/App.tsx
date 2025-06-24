import './App.css'
import LoginPage from "@/pages/login.page";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import RoundPage from "@/pages/round.page";
import RoundsListPage from "@/pages/rounds-list.page";
import {storage} from "@/lib/storage";
import {AppHeader} from "@/components/cells/header";

function App() {
  const token = storage.getToken()

  if (token) {
      return (
          <BrowserRouter>
              <AppHeader />
              <div className="mt-20 w-[80vw] max-w-[640px]">
                  <Routes>
                      <Route path="/rounds" element={<RoundsListPage />} />
                      <Route path="/rounds/:roundId" element={<RoundPage />} />

                      <Route path="*" element={<Navigate to="/rounds" replace />} />
                  </Routes>
              </div>
          </BrowserRouter>
      )
  }

  return (
      <BrowserRouter>
          <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
      </BrowserRouter>
  )
}

export default App
