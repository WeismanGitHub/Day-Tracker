import { chartSchema, problemDetailsSchema } from '../schemas';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NavBar from '../navbar';
import axios from 'axios';
import { Breadcrumb, Toast, ToastContainer } from 'react-bootstrap';

export default function Chart() {
    const [chart, setChart] = useState<Chart | null>();
    const { chartId } = useParams();
    const navigate = useNavigate();

    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        (async function () {
            try {
                const res = await axios.get<Chart>(`/Api/Charts/${chartId}`);

                if (!chartSchema.validateSync(res.data)) {
                    throw new Error();
                }

                setChart(res.data);
            } catch (err) {
                if (
                    axios.isAxiosError<CustomError>(err) &&
                    problemDetailsSchema.isValidSync(err.response?.data)
                ) {
                    if (err.response.status == 401) {
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
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar">
                <h4 className="ps-4 pt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/charts/${chartId}`}>{chart?.name}</Breadcrumb.Item>
                    </Breadcrumb>
                </h4>
                <div className="d-flex justify-content-center align-items-center"></div>
            </div>

            <ToastContainer position="top-end">
                <Toast
                    onClose={() => setError(null)}
                    show={error !== null}
                    autohide={true}
                    className="d-inline-block m-1"
                    bg={'danger'}
                >
                    <Toast.Header>
                        <strong className="me-auto">{error?.title}</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        <strong>{error?.detail ?? 'Something went wrong.'}</strong>
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <ToastContainer position="top-end">
                <Toast
                    onClose={() => setSuccess(null)}
                    show={success !== null}
                    autohide={true}
                    className="d-inline-block m-1"
                    bg={'success'}
                >
                    <Toast.Header>
                        <strong className="me-auto">{'Success!'}</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        <strong>{success}</strong>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}