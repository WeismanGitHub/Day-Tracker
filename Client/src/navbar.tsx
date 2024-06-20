import { ToastContainer, Toast, Modal, Button } from 'react-bootstrap';
import { problemDetailsSchema } from './schemas';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function NavBar() {
    const [authenticated] = useState(Boolean(localStorage.getItem('authenticated')));
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

            <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="navbar">
                <Link className="navbar-brand" to={'/'}>
                    <span className="d-block d-sm-inline-block fs-3">Day Tracker</span>
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarResponsive"
                    aria-controls="navbarResponsive"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarResponsive">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link className="nav-link" to={'/'}>
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to={'/about'}>
                                About
                            </Link>
                        </li>
                        {authenticated && (
                            <li className="nav-item">
                                <Link className="nav-link" to={'/account'}>
                                    Account
                                </Link>
                            </li>
                        )}
                        <li className="nav-item">
                            {authenticated ? (
                                <div
                                    className="nav-link"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setShowModal(true)}
                                >
                                    Sign Out
                                </div>
                            ) : (
                                <Link className="nav-link" to="/Auth">
                                    Sign In
                                </Link>
                            )}
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
}
