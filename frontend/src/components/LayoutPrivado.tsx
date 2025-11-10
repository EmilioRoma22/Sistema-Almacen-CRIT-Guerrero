// LayoutPrivado.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar/Sidebar";

export default function LayoutPrivado() {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <Outlet />
            </main>
        </div>
    );
}
