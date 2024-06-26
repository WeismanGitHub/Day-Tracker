import { nameSchema, passwordSchema } from '../schemas';
import { Form, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { handleErrors } from '../helpers';
import { Formik } from 'formik';
import NavBar from '../navbar';
import * as yup from 'yup';
import axios from 'axios';
import {
    Button,
    Card,
    Col,
    FormControl,
    FormGroup,
    FormLabel,
    InputGroup,
    Modal,
    Row,
    Toast,
    ToastContainer,
} from 'react-bootstrap';

interface Account {
    id: string;
    name: string;
    createdAt: string;
}

const accountSchema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(),
    createdAt: yup.string().required(),
});

export default function Account() {
    const [account, setAccount] = useState<Account | null>(null);
    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        handleErrors(
            async () => {
                const res = await axios.get<Account>('/Api/Users/Account');

                if (!accountSchema.validateSync(res.data)) {
                    throw new Error();
                }

                setAccount(res.data);
            },
            setError,
            navigate
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <NavBar />
            <div className="d-flex justify-content-center align-items-center full-height-minus-navbar">
                <div className="container">
                    <Card style={{ maxWidth: '800px' }} className="mx-auto shadow">
                        <Card.Header className="bg-primary text-white">
                            <h2>{account?.name}</h2>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Card.Text>
                                    <strong>Created:</strong>{' '}
                                    {account && new Date(account.createdAt).toLocaleString()}
                                </Card.Text>
                            </Row>
                            <Row>
                                <Col className="d-flex justify-content-end">
                                    {account && (
                                        <EditAccount
                                            account={account}
                                            setAccount={setAccount}
                                            setError={setError}
                                            setSuccess={setSuccess}
                                        />
                                    )}
                                    <DeleteAccount setError={setError} />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
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
                    onClose={() => setSuccess(false)}
                    show={success}
                    autohide={true}
                    className="d-inline-block m-1"
                    bg={'success'}
                >
                    <Toast.Header>
                        <strong className="me-auto">{'Success!'}</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        <strong>{'You updated your account.'}</strong>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

function DeleteAccount({ setError }: { setError: setError }) {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(password: string) {
        handleErrors(
            async () => {
                await axios.delete('/Api/Users/Account', {
                    data: {
                        password,
                    },
                });

                localStorage.removeItem('authenticated');
                navigate('/auth');
            },
            setError,
            navigate
        );
    }

    return (
        <>
            <Button variant="danger" onClick={() => setShow(true)}>
                Delete
            </Button>

            <Formik
                validationSchema={yup.object().shape({
                    password: passwordSchema.required('Input your current password.'),
                })}
                validateOnMount
                validateOnChange
                initialValues={{
                    password: '',
                }}
                onSubmit={(values) => handleSubmit(values.password)}
            >
                {({ handleSubmit, handleChange, values, errors }) => (
                    <Modal
                        show={show}
                        centered
                        keyboard={true}
                        onHide={() => setShow(false)}
                        animation={false}
                    >
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Header closeButton>
                                <Modal.Title>Delete your account?</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row className="mb-3">
                                    <FormGroup as={Col} controlId="PasswordId">
                                        <FormLabel>Password</FormLabel>
                                        <InputGroup hasValidation>
                                            <FormControl
                                                autoComplete="on"
                                                type="password"
                                                aria-describedby="inputGroupPrepend"
                                                name="password"
                                                value={values.password}
                                                onChange={handleChange}
                                                isInvalid={!!errors.password}
                                            />
                                            <FormControl.Feedback type="invalid">
                                                {errors.password}
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    </FormGroup>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="submit" variant="danger">
                                    Delete
                                </Button>
                                <Button variant="secondary" onClick={() => setShow(false)}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                )}
            </Formik>
        </>
    );
}

function EditAccount({
    setError,
    setAccount,
    account,
    setSuccess,
}: {
    account: Account;
    setError: setError;
    setAccount: setState<Account | null>;
    setSuccess: setState<string>;
}) {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(values: { password: string; newName: string; newPassword: string }) {
        handleErrors(
            async () => {
                await axios.patch('/Api/Users/Account', {
                    currentPassword: values.password,
                    newData: {
                        ...(values.newName ? { name: values.newName } : {}),
                        ...(values.newPassword ? { password: values.newPassword } : {}),
                    },
                });

                if (values.newName && account) {
                    setAccount({
                        name: values.newName,
                        createdAt: account.createdAt,
                        id: account.id,
                    });
                }

                setSuccess(true);
            },
            setError,
            navigate
        );
    }

    return (
        account && (
            <>
                <Button variant="warning" onClick={() => setShow(true)} className="me-2">
                    Edit
                </Button>

                <Formik
                    validationSchema={yup.object().shape({
                        password: passwordSchema.required('Input your current password.'),
                        newPassword: passwordSchema.notRequired(),
                        newName: nameSchema.notRequired(),
                    })}
                    validate={(values) => {
                        const errors: {
                            password?: string;
                            newPassword?: string;
                            newName?: string;
                        } = {};

                        if (!values.newPassword && !values.newName) {
                            errors.newPassword = 'Must update something.';
                            errors.newName = 'Must update something.';
                        }

                        if (values.newPassword == values.password && values.password !== '') {
                            errors.password = 'Passwords cannot match.';
                        }

                        return errors;
                    }}
                    validateOnChange
                    initialValues={{
                        newPassword: '',
                        password: '',
                        newName: '',
                    }}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit, handleChange, values, errors }) => (
                        <Modal
                            show={show}
                            centered
                            keyboard={true}
                            onHide={() => setShow(false)}
                            animation={false}
                        >
                            <Form noValidate onSubmit={handleSubmit}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Update your account?</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row className="mb-3">
                                        <FormGroup as={Col} controlId="NewNameID">
                                            <FormLabel>New Name</FormLabel>
                                            <InputGroup hasValidation>
                                                <FormControl
                                                    autoComplete="off"
                                                    autoFocus
                                                    aria-describedby="inputGroupPrepend"
                                                    name="newName"
                                                    value={values.newName}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.newName}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.newName}
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        </FormGroup>
                                    </Row>
                                    <Row className="mb-3">
                                        <FormGroup as={Col} controlId="NewPasswordId">
                                            <FormLabel>New Password</FormLabel>
                                            <InputGroup hasValidation>
                                                <FormControl
                                                    type="password"
                                                    autoComplete="off"
                                                    aria-describedby="inputGroupPrepend"
                                                    name="newPassword"
                                                    value={values.newPassword}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.newPassword}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.newPassword}
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        </FormGroup>
                                    </Row>
                                    <Row className="mb-3">
                                        <FormGroup as={Col} controlId="CurrentPasswordId">
                                            <FormLabel>Current Password</FormLabel>
                                            <InputGroup hasValidation>
                                                <FormControl
                                                    autoComplete="on"
                                                    type="password"
                                                    aria-describedby="inputGroupPrepend"
                                                    name="password"
                                                    value={values.password}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.password}
                                                />
                                                <FormControl.Feedback type="invalid">
                                                    {errors.password}
                                                </FormControl.Feedback>
                                            </InputGroup>
                                        </FormGroup>
                                    </Row>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button type="submit" variant="warning">
                                        Update
                                    </Button>
                                    <Button variant="secondary" onClick={() => setShow(false)}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Form>
                        </Modal>
                    )}
                </Formik>
            </>
        )
    );
}
