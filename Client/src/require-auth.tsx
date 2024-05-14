import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RequireAuthentication({ element }: { element: JSX.Element }): JSX.Element {
    const authenticated = localStorage.getItem('authenticated');
    const navigate = useNavigate();

    useEffect(() => {
        if (!authenticated) {
            navigate('/auth');
        }
    }, []);

    return element;
}