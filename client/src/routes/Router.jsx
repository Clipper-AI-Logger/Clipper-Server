import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import EditPage1 from "../pages/Edit/Edit1/EditPage1";
import EditPage2 from "../pages/Edit/Edit2/EditPage2";
import EditPage3 from "../pages/Edit/Edit3/EditPage3";
import Premium from "../pages/premium/Premium/Premium"; 
import ModifyPage1 from "../pages/premium/Modify/Modify1/ModifyPage1";
import ModifyPage2 from "../pages/premium/Modify/Modify2/ModifyPage2";
import ModifyPage3 from "../pages/premium/Modify/Modify3/ModifyPage3";
import CompletePage from "../pages/Complete/CompletePage";


function Router() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                
                <Route path="/edit/1" element={<EditPage1 />} />
                <Route path="/edit/2" element={<EditPage2 />} />
                <Route path="/edit/3" element={<EditPage3 />} />
                
                <Route path="/premium" element={<Premium />} />
                <Route path="/premium/modify/1" element={<ModifyPage1 />} />
                <Route path="/premium/modify/2" element={<ModifyPage2 />} />
                <Route path="/premium/modify/3" element={<ModifyPage3 />} />
                
                <Route path="/complete" element={<CompletePage />} />
            </Routes>
        </div>
    );
}

export default Router;
