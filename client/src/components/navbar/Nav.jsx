import React from "react";
import './Nav.css'
import { useHandleRoute } from "../../lib/util";

const Nav = () => {
    const { handleRoute } = useHandleRoute();
    return (
        <img className="navLogo" src="/logo.png" alt="logo" onClick={ () => handleRoute("/") } />
    );
};

export default Nav;