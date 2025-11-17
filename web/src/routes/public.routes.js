import { Routes, Route } from "react-router-dom";
import Home from "../pages/Cliente/Home";
import Login from "../pages/Cliente/Login";
import Cadastro from "../pages/Cliente/Cadastro";

const PublicRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="*" element={<Home />} />
        </Routes>
    );
};

export default PublicRoutes;

