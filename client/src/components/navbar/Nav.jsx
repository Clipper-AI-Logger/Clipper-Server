import React from "react";
import './Nav.css'
import { useHandleRoute } from "../../lib/util";
import Logo from "../Logo/Logo";

const Nav = () => {
    const { handleRoute } = useHandleRoute();
    return (
        <div className="nav" onClick={ () => handleRoute("/") }>
            <Logo imgWidth={50} textWidth={130} />
        </div>
    );
};

export default Nav;