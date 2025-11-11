import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import React from "react";
import { AnimatePresence } from "motion/react";
import { ErrorTokenExpirado } from "./errores/ErrorTokenExpirado";

export default function LayoutPrivado() {
    const { sesionExpirada } = useAuth()

    return (
        <React.Fragment>
            <div className="flex h-screen overflow-hidden bg-white">
                <Sidebar />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>

            <AnimatePresence>
                {sesionExpirada && (
                    <ErrorTokenExpirado />
                )}
            </AnimatePresence>
        </React.Fragment>
    );
}
