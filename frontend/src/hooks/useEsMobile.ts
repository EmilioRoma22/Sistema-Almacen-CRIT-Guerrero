import { useEffect, useState } from "react";

export function useIsMobile(breakpoint: number = 768) {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, [breakpoint]);

    return isMobile;
}
