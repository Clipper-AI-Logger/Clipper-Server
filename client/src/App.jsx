import './styles/common/App.css';
import Router from "./routes/Router";
import Nav from "./components/navbar/Nav"


function App() {
    return (
        <div className="App">
            <div className="navbar">
                <Nav />
            </div>
            <div className="route">
                <Router />
            </div>
        </div>
    );
}

export default App;