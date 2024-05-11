import { problemDetailsSchema } from './schemas';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, Toast, Modal, Button } from 'react-bootstrap';

export default function NavBar() {
    const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('authenticated')));
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();

    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);

    async function signout() {
        try {
            await axios.post('Api/Users/Account/SignOut');
            localStorage.removeItem('authenticated');
            setAuthenticated(false);
            setShowModal(false);
            setSuccess(true);
        } catch (err) {
            if (
                axios.isAxiosError<CustomError>(err) &&
                problemDetailsSchema.isValidSync(err.response?.data)
            ) {
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

    return (
        <>
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
                    <Toast.Body>{error?.detail}</Toast.Body>
                </Toast>
            </ToastContainer>
            <ToastContainer position="top-end">
                <Toast
                    onClose={() => setSuccess(false)}
                    show={success}
                    autohide={true}
                    className="d-inline-block m-1"
                    bg={'success'}
                >
                    <Toast.Header>
                        <strong className="me-auto">Success!</strong>
                    </Toast.Header>
                    <Toast.Body>Signed out</Toast.Body>
                </Toast>
            </ToastContainer>

            <Modal show={showModal} centered keyboard={true} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure you want to sign out?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={signout}>
                        Sign Out
                    </Button>
                </Modal.Footer>
            </Modal>

            <nav
                className="navbar navbar-expand-md py-1 ps-2 pe-2"
                style={{ textAlign: 'center', fontSize: 'x-large', backgroundColor: '#9CC3FF' }}
            >
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src="/icon.svg" width="50" height="50" alt="icon" className="me-2" />
                        <span className="d-block d-sm-inline-block">Day Tracker</span>
                    </a>
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        aria-controls="navbarNav"
                        aria-expanded={isNavOpen ? 'true' : 'false'}
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div
                        className={`justify-content-end collapse navbar-collapse${isNavOpen ? ' show' : ''}`}
                        id="navbarNav"
                    >
                        <ul className="navbar-nav d-flex justify-content-center align-items-center">
                            <li className={`m-1 w-50 ${isNavOpen ? ' mb-2' : ''}`}>
                                <a className="nav-item active w-100" href="/about" style={{ color: 'white' }}>
                                    About
                                </a>
                            </li>
                            <li className={`m-1 w-50 ${isNavOpen ? ' mb-2' : ''}`}>
                                <a
                                    className="nav-item active w-100"
                                    href="/swagger/index.html"
                                    style={{ color: 'white' }}
                                >
                                    Swagger
                                </a>
                            </li>
                            <li className={`m-1 w-50 ${isNavOpen ? ' mb-2' : ''}`}>
                                <a
                                    className="nav-item active w-100"
                                    href="https://github.com/WeismanGitHub/Day-Tracker"
                                    style={{ color: 'white' }}
                                >
                                    GitHub
                                </a>
                            </li>
                            <li className={`m-1 w-75 ${isNavOpen ? ' mb-2' : ''}`}>
                                <a
                                    className="nav-item active w-100"
                                    onClick={() => (authenticated ? setShowModal(true) : navigate('/Auth'))}
                                    style={{ color: 'white' }}
                                >
                                    {authenticated ? 'Sign Out' : 'Sign In'}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}
