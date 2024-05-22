import { NavigateFunction } from 'react-router-dom';
import { problemDetailsSchema } from './schemas';
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

export { handleErrors };
