import { Form, NavigateFunction, useNavigate } from 'react-router-dom';
import { problemDetailsSchema } from '../schemas';
import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import NavBar from '../navbar';
import axios from 'axios';
import * as yup from 'yup';
import axios from 'axios';
import {
    Button,
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
import { Formik } from 'formik';

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
            {account?.name}

            <Row>
                <EditAccount setError={setError} navigate={navigate} />
                <DeleteAccount setError={setError} navigate={navigate} />
            </Row>

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

function DeleteAccount({ setError, navigate }: { setError: setError; navigate: NavigateFunction }) {
    const [show, setShow] = useState(false);

    async function handleSubmit(password: string) {
        try {
            await axios.delete('/Api/Users/Account', {
                data: {
                    password
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
            <Button onClick={() => setShow(true)}>Delete</Button>

            <Formik
                validationSchema={yup.object().shape({
                    password: yup.string().required('Input your current password.'),
                })}
                validateOnMount
                validateOnChange
                initialValues={{
                    password: '',
                }}
                onSubmit={(values) => handleSubmit(values.password)}
            >
                {({ handleSubmit, handleChange, values, errors }) => (
                    <Modal show={show} centered keyboard={true} onHide={() => setShow(false)}>
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
