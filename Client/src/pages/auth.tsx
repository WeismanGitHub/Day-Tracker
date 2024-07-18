import { nameSchema, passwordSchema, problemDetailsSchema } from '../schemas';
import { useNavigate } from 'react-router-dom';
import * as formik from 'formik';
import { useState } from 'react';
import NavBar from '../navbar';
import { Form } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import {
    ToastContainer,
    FormControl,
    InputGroup,
    FormGroup,
    FormLabel,
    Button,
    Toast,
    Row,
    Col,
    Card,
} from 'react-bootstrap';

const { Formik } = formik;

const signinSchema = yup.object().shape({
    name: nameSchema,
    password: passwordSchema,
});

const signupSchema = signinSchema.shape({
    confirmPassword: yup.string().required('Please confirm your password.'),
});

export default function Auth() {
    const [showSignin, setShowSignin] = useState<boolean>(false);
    const [error, setError] = useState<CustomError | null>(null);

    return (
        <>
            <NavBar />
            <div className="d-flex justify-content-center align-items-center full-height-minus-navbar overflow-x-hidden">
                <Card style={{ maxWidth: '500px', width: '80%' }} className="mx-auto shadow">
                    <Card.Header className="bg-primary text-white">
                        <h2>{showSignin ? 'Sign In' : 'Sign Up'}</h2>
                    </Card.Header>
                    <Card.Body>
                        {showSignin ? (
                            <Signin
                                setError={setError}
                                showSignin={showSignin}
                                setShowSignin={setShowSignin}
                            />
                        ) : (
                            <Signup
                                setError={setError}
                                showSignin={showSignin}
                                setShowSignin={setShowSignin}
                            />
                        )}
                    </Card.Body>
                </Card>

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
            </div>
        </>
    );
}

function Signup({
    setError,
    setShowSignin,
    showSignin,
}: {
    setError: setError;
    setShowSignin: setState<boolean>;
    showSignin: boolean;
}) {
    const navigate = useNavigate();

    return (
        <>
            <Formik
                initialValues={{
                    name: '',
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={signupSchema}
                validate={(values) => {
                    const errors: {
                        password?: string;
                        confirmPassword?: string;
                    } = {};

                    if (values.password !== values.confirmPassword) {
                        errors.confirmPassword = 'Passwords do not match.';
                    }

                    return errors;
                }}
                validateOnChange
                onSubmit={async (values) => {
                    try {
                        await axios.post('/Api/Users/SignUp', {
                            name: values.name,
                            password: values.password,
                        });

                        localStorage.setItem('authenticated', 'true');
                        navigate('/');
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
                }}
            >
                {({ handleSubmit, handleChange, values, errors, setFieldValue, setValues }) => {
                    function generateString(limit: number): string {
                        const characters = 'abcdefghijklmnopqrstuvwxyz';
                        const chaactersLength = characters.length;
                        let result = '';

                        for (let i = 0; i < limit; i++) {
                            result += characters.charAt(Math.floor(Math.random() * chaactersLength));
                        }

                        return result;
                    }

                    async function generateCredentials() {
                        const name = generateString(7);
                        const password =
                            generateString(10) +
                            generateString(1).toUpperCase() +
                            Math.floor(Math.random() * 10);

                        setFieldValue('name', name);
                        setFieldValue('password', password);
                        setFieldValue('confirmPassword', password);
                        setValues({
                            name,
                            password,
                            confirmPassword: password,
                        });
                    }

                    return (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Row className="mb-3">
                                <FormGroup as={Col} controlId="nameId">
                                    <FormLabel>Name</FormLabel>
                                    <InputGroup hasValidation>
                                        <FormControl
                                            autoFocus
                                            autoComplete="on"
                                            type="text"
                                            aria-describedby="inputGroupPrepend"
                                            name="name"
                                            value={values.name}
                                            onChange={handleChange}
                                            isInvalid={!!errors.name}
                                        />
                                        <FormControl.Feedback type="invalid">
                                            {errors.name}
                                        </FormControl.Feedback>
                                    </InputGroup>
                                </FormGroup>
                            </Row>
                            <Row className="mb-3">
                                <FormGroup as={Col} controlId="PasswordID">
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
                            <Row className="mb-3">
                                <FormGroup as={Col} controlId="ConfirmPasswordID">
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl
                                        autoComplete="on"
                                        type="password"
                                        name="confirmPassword"
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        isInvalid={!!errors.confirmPassword}
                                    />
                                    <FormControl.Feedback type="invalid">
                                        {errors.confirmPassword}
                                    </FormControl.Feedback>
                                </FormGroup>
                            </Row>
                            <Row>
                                <Col className="d-flex justify-content-end">
                                    <Button type="submit">Sign Up</Button>
                                    <Button
                                        className="ms-1 text-white"
                                        variant="info"
                                        onClick={generateCredentials}
                                    >
                                        Generate
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="ms-1"
                                        onClick={() => setShowSignin(!showSignin)}
                                    >
                                        Sign In
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    );
                }}
            </Formik>
        </>
    );
}

function Signin({
    setError,
    setShowSignin,
    showSignin,
}: {
    setError: setError;
    setShowSignin: setState<boolean>;
    showSignin: boolean;
}) {
    const navigate = useNavigate();

    return (
        <>
            <Formik
                validationSchema={signinSchema}
                validateOnChange
                onSubmit={async (values) => {
                    try {
                        await axios.post('/Api/Users/Account/SignIn', {
                            name: values.name,
                            password: values.password,
                        });

                        localStorage.setItem('authenticated', 'true');
                        navigate('/');
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
                }}
                initialValues={{
                    name: '',
                    password: '',
                }}
            >
                {({ handleSubmit, handleChange, values, errors }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <FormGroup as={Col} controlId="nameId">
                                <FormLabel>Name</FormLabel>
                                <InputGroup hasValidation>
                                    <FormControl
                                        autoComplete="on"
                                        autoFocus
                                        type="text"
                                        aria-describedby="inputGroupPrepend"
                                        name="name"
                                        value={values.name}
                                        onChange={handleChange}
                                        isInvalid={!!errors.name}
                                    />
                                    <FormControl.Feedback type="invalid">{errors.name}</FormControl.Feedback>
                                </InputGroup>
                            </FormGroup>
                        </Row>
                        <Row className="mb-3">
                            <FormGroup as={Col} controlId="PasswordID">
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
                        <Row>
                            <Col className="d-flex justify-content-end">
                                <Button type="submit">Sign In</Button>
                                <Button
                                    variant="secondary"
                                    className="ms-1"
                                    onClick={() => setShowSignin(!showSignin)}
                                >
                                    Sign Up
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Formik>
        </>
    );
}
