import { Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage";
import GetDataPage from "../pages/edit/GetDataPage";
import GetVideoPage from "../pages/edit/GetVideoPage";
import GetModifyVideo from "../pages/premium/GetModifyVideo";
import GetModifyPrompt from "../pages/premium/GetModifyPrompt";
import GetEditHistory from "../pages/premium/GetEditHistory";
import CompletePage from "../pages/edit/CompletePage";
import CheckUser from "../pages/premium/CheckUser";

function Router() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/edit/1" element={<GetDataPage />} />
                <Route path="/edit/2" element={<GetVideoPage />} />

                <Route path="/premium" element={<CheckUser />} />
                <Route path="/premium/modify/1" element={<GetEditHistory />} />
                <Route path="/premium/modify/2" element={<GetModifyVideo />} />
                <Route path="/premium/modify/3" element={<GetModifyPrompt />} />
                
                <Route path="/complete" element={<CompletePage />} />
            </Routes>
        </div>
    );
}

export default Router;
