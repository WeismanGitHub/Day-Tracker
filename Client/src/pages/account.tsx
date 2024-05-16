import { nameSchema, passwordSchema, problemDetailsSchema } from '../schemas';
import { Form, NavigateFunction, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    chartCount: number;
    createdAt: string;
}

const accountSchema = yup.object().shape({
    id: yup.string().required(),
    name: yup.string().required(),
    chartCount: yup.number().required(),
    createdAt: yup.string().required(),
});

export default function Account() {
    const [account, setAccount] = useState<Account | null>(null);
    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async function () {
            try {
                const res = await axios.get<Account>('/Api/Users/Account');

                if (!accountSchema.validateSync(res.data)) {
                    throw new Error();
                }

                setAccount(res.data);
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
            <div className="d-flex justify-content-center align-items-center full-height-minus-navbar">
                <div className="container">
                    {account ? (
                        <Card style={{ maxWidth: '800px' }} className="mx-auto">
                            <Card.Header className='bg-primary text-white'>
                                <h2>{account.name}</h2>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <Card.Text>
                                            <strong>Charts:</strong> {account.chartCount}
                                        </Card.Text>
                                        <Card.Text>
                                            <strong>Created:</strong>{' '}
                                            {new Date(account.createdAt).toLocaleString()}
                                        </Card.Text>
                                    </Col>
                                </Row>
                                <Row className="mt-3">
                                    <Col className="d-flex justify-content-end">
                                        <EditAccount
                                            setSuccess={setSuccess}
                                            setError={setError}
                                            navigate={navigate}
                                            setAccount={setAccount}
                                            account={account}
                                        />
                                        <DeleteAccount setError={setError} navigate={navigate} />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ) : (
                        <div>Loading...</div>
                    )}
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
                    <Toast.Body>{error?.detail ?? 'Something went wrong.'}</Toast.Body>
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
                    <Toast.Body>{'You updated your account.'}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

function DeleteAccount({ setError, navigate }: { setError: setError; navigate: NavigateFunction }) {
    const [show, setShow] = useState(false);

    async function handleSubmit(password: string) {
        try {
            await axios.delete('/Api/Users/Account', {
                data: {
                    password,
                },
            });

            navigate('/auth');
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
                                <Button type="submit">Delete</Button>
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
    navigate,
    setAccount,
    account,
    setSuccess,
}: {
    setError: setError;
    navigate: NavigateFunction;
    setAccount: setState<Account | null>;
    account: Account | null;
    setSuccess: setState<boolean>;
}) {
    const [show, setShow] = useState(false);

    async function handleSubmit(values: { currentPassword: string; newName: string; newPassword: string }) {
        try {
            await axios.patch('/Api/Users/Account', {
                currentPassword: values.currentPassword,
                newData: {
                    ...(values.newName ? { name: values.newName } : {}),
                    ...(values.newPassword ? { password: values.newPassword } : {}),
                },
            });

            if (values.newName && account) {
                setAccount({
                    name: values.newName,
                    chartCount: account.chartCount,
                    createdAt: account.createdAt,
                    id: account.id,
                });
            }

            setShow(false);
            setSuccess(true);
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
    }

    return (
        <>
            <Button variant="warning" onClick={() => setShow(true)} className="me-2">
                Edit
            </Button>

            <Formik
                validationSchema={yup.object().shape({
                    currentPassword: passwordSchema.required('Input your current password.'),
                    newPassword: passwordSchema.notRequired(),
                    newName: nameSchema.notRequired(),
                })}
                validate={(values) => {
                    const errors: {
                        currentPassword?: string;
                        newPassword?: string;
                        newName?: string;
                    } = {};

                    if (!values.newPassword && !values.newName) {
                        errors.newPassword = 'Must update something.';
                        errors.newName = 'Must update something.';
                    }

                    if (values.newPassword == values.currentPassword) {
                        errors.currentPassword = 'Passwords cannot match.';
                    }

                    return errors;
                }}
                validateOnChange
                initialValues={{
                    newPassword: '',
                    currentPassword: '',
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
                                                type="password"
                                                aria-describedby="inputGroupPrepend"
                                                name="currentPassword"
                                                value={values.currentPassword}
                                                onChange={handleChange}
                                                isInvalid={!!errors.currentPassword}
                                            />
                                            <FormControl.Feedback type="invalid">
                                                {errors.currentPassword}
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    </FormGroup>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="submit">Update</Button>
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
