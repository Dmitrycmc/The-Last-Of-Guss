import { storage } from "@/lib/storage";
import { Button } from "@/components/atoms/button";
import useUserInfo from "@/hooks/useUserInfo";

export function AppHeader() {
    const onLogout = () => {
        storage.deleteToken();
        window.location.assign("/login");
    };

    const decodedToken = useUserInfo();

    return (
        <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-white shadow-md sticky top-0 left-0 right-0 z-50 gap-3">
            {/* Лого / Нав */}
            <nav className="text-gray-800 font-medium flex-shrink-0">
                <a className="text-lg sm:text-xl font-semibold text-blue-600" href="/rounds">
                    🪿 The Last of Guss 🪿
                </a>
            </nav>

            {/* Профиль + logout */}
            <div className="flex items-center gap-3 ml-auto">
                <div className="text-right min-w-0">
                    <div className="text-sm font-semibold truncate">{decodedToken?.username}</div>
                    <div className="text-xs text-gray-500 truncate">{decodedToken?.role}</div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={onLogout}
                >
                    Выйти
                </Button>
            </div>
        </header>
    );
}