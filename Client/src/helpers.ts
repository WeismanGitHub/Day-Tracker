import { NavigateFunction, useNavigate } from 'react-router-dom';
import { problemDetailsSchema } from './schemas';
import { useEffect } from 'react';
import axios from 'axios';

async function handleErrors(func: () => Promise<unknown>, setError: setError, navigate: NavigateFunction) {
    try {
        await func();
    } catch (err) {
        if (axios.isAxiosError<CustomError>(err) && problemDetailsSchema.isValidSync(err.response?.data)) {
            if (err.response.status == 401) {
                localStorage.removeItem('authenticated');
                return navigate('/auth');
            }

            setError(err.response.data);
        } else {
            setError({
                title: 'Unknown Error',
                detail: 'Something went wrong!',
                status: 500,
            });
        }
    }
}

function RequireAuthentication({ element }: { element: JSX.Element }): JSX.Element {
    const authenticated = localStorage.getItem('authenticated');
    const navigate = useNavigate();

    useEffect(() => {
        if (!authenticated) {
            navigate('/auth');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return element;
}

enum ChartType {
    Counter = 0,
    Checkmark = 1,
    Scale = 2,
}

export { handleErrors, RequireAuthentication, ChartType };
