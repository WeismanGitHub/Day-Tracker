import { NavigateFunction, useNavigate } from 'react-router-dom';
import { problemDetailsSchema } from '../schemas';
import * as formik from 'formik';
import { useState } from 'react';
import NavBar from '../navbar';
import { Form } from 'formik';
import axios from 'axios';
import * as yup from 'yup'
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
    name: yup
        .string()
        .required('Name is a required field.')
        .min(1, 'Must be at least 1 character.')
        .max(50, 'Cannot be more than 50 characters.'),
    password: yup
        .string()
        .required('Password is a required field.')
        .min(10, 'Must be at least 10 characters.')
        .max(70, 'Cannot be more than 70 characters.'),
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
            <div className="container">
                <div className="row vh-100 align-items-center justify-content-center m-1 text-center">
                    <div className="col-sm-8 col-md-6 col-lg-4 bg-white rounded shadow">
                        {showSignin ? <Signin setError={setError} navigate={navigate} /> : <Signup />}
                        <Button
                            className="btn-secondary mt-1 mb-1 bg-bg-secondary-subtle btn-sm"
                            onClick={() => setShowSignin(!showSignin)}
                        >
                            {showSignin ? 'Sign In' : 'Sign Up'}
                        </Button>
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
                    <Toast.Body>{error?.detail ?? 'Something went wrong.'}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

function Signin({ setError, navigate }: { setError: setError; navigate: NavigateFunction }) {
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

                    let hasUpperCase = false;
                    let hasLowerCase = false;
                    let hasDigit = false;

                    values.password.split('').forEach((char) => {
                        if (char.toLocaleLowerCase() === char) {
                            hasLowerCase = true;
                        }
                        if (char.toLocaleUpperCase() === char) {
                            hasUpperCase = true;
                        }
                        if (!isNaN(Number(char))) {
                            hasDigit = true;
                        }
                    });

                    if (!hasLowerCase) {
                        errors.password = 'Missing a lower case letter.';
                    } else if (!hasUpperCase) {
                        errors.password = 'Missing an upper case letter.';
                    } else if (!hasDigit) {
                        errors.password = 'Missing a digit.';
                    }

                    return errors;
                }}
                validateOnChange
                onSubmit={async (values) => {
                    try {
                        await axios.post('/Api/Users/Account/SignUp', {
                            name: values.name,
                            password: values.password,
                        });

                        localStorage.setItem('loggedIn', 'true');
                        navigate('/');
                    } catch (err) {
                        if (
                            axios.isAxiosError<CustomError>(err) &&
                            problemDetailsSchema.isValidSync(err.response?.data)
                        ) {
                            setError(err.response.data);
                        } else {
                            setError({
                                title: 'Unknown',
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
                                        placeholder="Name"
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

function Signup() {
    return <>
    </>;
}
