import {storage} from "@/lib/storage";
import {Button} from "@/components/atoms/button";
import useUserInfo from "@/hooks/useUserInfo";

export function AppHeader() {
    const onLogout = () => {
        storage.deleteToken()
        window.location.assign('/login')
    }

    const decodedToken = useUserInfo()

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md sticky top-0 left-0 right-0 z-50">
            {/* Навигация */}
            <nav className="flex items-center gap-6 text-gray-800 font-medium">
                <a className="text-xl font-semibold text-blue-600" href="/rounds">🪿The last of Guss 🪿</a>
            </nav>

            {/* Профиль */}
            <div className="ml-[100px] flex items-center gap-4">
                <div className="text-right">
                    <div className="text-sm font-semibold">{decodedToken!.username}</div>
                    <div className="text-xs text-gray-500">{decodedToken!.role}</div>
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