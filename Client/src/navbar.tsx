import { ToastContainer, Toast, Modal, Button } from 'react-bootstrap';
import { problemDetailsSchema } from './schemas';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function NavBar() {
    const [authenticated] = useState(Boolean(localStorage.getItem('authenticated')));
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();

    const [error, setError] = useState<CustomError | null>(null);
    const [showModal, setShowModal] = useState(false);

    async function signout() {
        try {
            await axios.post('/Api/Users/Account/SignOut');
            localStorage.removeItem('authenticated');
            setShowModal(false);
            setTimeout(() => {
                navigate('/auth');
            }, 500);
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
                    <Toast.Body className="text-white">
                        <strong>{error?.detail}</strong>
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Modal
                show={showModal}
                centered
                keyboard={true}
                onHide={() => setShowModal(false)}
                animation={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Are you sure you want to sign out?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button variant="danger" onClick={signout}>
                        Sign Out
                    </Button>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <nav
                className="navbar navbar-expand-md py-1 ps-2 pe-2"
                style={{ textAlign: 'center', fontSize: 'x-large', backgroundColor: '#9CC3FF' }}
            >
                <div className="container-fluid">
                    <Link className="navbar-brand" to={'/'}>
                        <img src="/icon.svg" width="50" height="50" alt="icon" className="me-2" />
                        <span className="d-block d-sm-inline-block">Day Tracker</span>
                    </Link>
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
                                <Link className="nav-item active w-100" to={'/'} style={{ color: 'white' }}>
                                    Home
                                </Link>
                            </li>
                            <li className={`m-1 w-50 ${isNavOpen ? ' mb-2' : ''}`}>
                                <Link
                                    className="nav-item active w-100"
                                    to="/about"
                                    style={{ color: 'white' }}
                                >
                                    About
                                </Link>
                            </li>
                            {authenticated && (
                                <li className={`m-1 w-50 ${isNavOpen ? ' mb-2' : ''}`}>
                                    <Link
                                        className="nav-item active w-100"
                                        to="/account"
                                        style={{ color: 'white' }}
                                    >
                                        Account
                                    </Link>
                                </li>
                            )}
                            <li
                                className={`m-1 w-100 ${isNavOpen ? ' mb-2' : ''}`}
                                style={{ maxWidth: isNavOpen ? '50%' : '75%' }}
                            >
                                {authenticated ? (
                                    <div
                                        className="nav-item active w-100"
                                        onClick={() => setShowModal(true)}
                                        style={{ color: 'white' }}
                                    >
                                        Sign Out
                                    </div>
                                ) : (
                                    <Link
                                        className="nav-item active w-100"
                                        style={{ color: 'white' }}
                                        to="/Auth"
                                    >
                                        Sign In
                                    </Link>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}
