import { nameSchema, passwordSchema, problemDetailsSchema } from '../schemas';
import { NavigateFunction, useNavigate } from 'react-router-dom';
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
    const [showSignin, setShowSignin] = useState<boolean>(true);
    const [error, setError] = useState<CustomError | null>(null);
    const navigate = useNavigate();

    return (
        <>
            <NavBar />
            <div className="d-flex justify-content-center align-items-center full-height-minus-navbar">
                <div className="container">
                    <div className="row align-items-center justify-content-center m-1 text-center">
                        <div className="col-sm-8 col-md-6 col-lg-4 bg-white rounded shadow">
                            {showSignin ? (
                                <Signin setError={setError} navigate={navigate} />
                            ) : (
                                <Signup setError={setError} navigate={navigate} />
                            )}
                            <Button
                                className="mt-1 mb-1 btn-custom-white btn-sm"
                                onClick={() => setShowSignin(!showSignin)}
                            >
                                {showSignin ? 'Sign Up' : 'Sign In'}
                            </Button>
                        </div>
                    </div>
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
                    <Toast.Body className='text-white'><strong>{error?.detail ?? 'Something went wrong.'}</strong></Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

function Signup({ setError, navigate }: { setError: setError; navigate: NavigateFunction }) {
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
                {({ handleSubmit, handleChange, values, errors }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row className="mb-3">
                            <FormGroup as={Col} controlId="nameId">
                                <FormLabel>Name</FormLabel>
                                <InputGroup hasValidation>
                                    <FormControl
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
                                <FormLabel>Confirm</FormLabel>
                                <FormControl
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
                        <Button type="submit">Sign Up</Button>
                    </Form>
                )}
            </Formik>
        </>
    );
}

function Signin({ setError, navigate }: { setError: setError; navigate: NavigateFunction }) {
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
                                        type="name"
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
                        <Button type="submit">Sign In</Button>
                    </Form>
                )}
            </Formik>
        </>
    );
}
