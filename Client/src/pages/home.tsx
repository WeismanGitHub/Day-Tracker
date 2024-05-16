import { Form, NavigateFunction, useNavigate } from 'react-router-dom';
import { problemDetailsSchema } from '../schemas';
import { useEffect, useState } from 'react';
import { Formik } from 'formik';
import NavBar from '../navbar';
import * as yup from 'yup';
import axios from 'axios';
import {
    ToastContainer,
    Toast,
    Button,
    Card,
    Row,
    Col,
    Modal,
    FormGroup,
    FormControl,
    FormLabel,
    InputGroup,
} from 'react-bootstrap';

enum ChartType {
    Counter = 0,
    CheckMark = 1,
    Scale = 2,
}

const ChartColorMap = {
    [ChartType.Counter]: '#CDABEB',
    [ChartType.CheckMark]: '#C1EBC0',
    [ChartType.Scale]: '#F09EA7',
};

const chartSchema = yup.array(
    yup.object().shape({
        id: yup.string().required(),
        name: yup.string().required(),
        type: yup.number().required(),
        createdAt: yup.string().required(),
    })
);

interface Chart {
    id: string;
    name: string;
    type: ChartType;
    createdAt: string;
}

export default function Home() {
    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [charts, setCharts] = useState<Chart[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async function () {
            try {
                const res = await axios.get<Chart[]>('/Api/Charts');

                if (!chartSchema.validateSync(res.data)) {
                    throw new Error();
                }

                setCharts(res.data);
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
            <div className="full-height-minus-navbar d-flex">
                <div className="container mt-3">
                    <Card style={{ maxWidth: '500px' }} className="mx-auto">
                        <Card.Header>
                            <h2>Charts</h2>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>
                                    <Card.Text>
                                        <strong>Total:</strong> {charts?.length}
                                    </Card.Text>
                                </Col>
                            </Row>
                            <Row className="mt-3">
                                <Col className="d-flex justify-content-center">
                                    <CreateChartButton
                                        navigate={navigate}
                                        setSuccess={setSuccess}
                                        setError={setError}
                                        setCharts={setCharts}
                                        charts={charts}
                                    />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Charts charts={charts} setCharts={setCharts} />
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
                    onClose={() => setSuccess(null)}
                    show={success !== null}
                    autohide={true}
                    className="d-inline-block m-1"
                    bg={'success'}
                >
                    <Toast.Header>
                        <strong className="me-auto">{'Success!'}</strong>
                    </Toast.Header>
                    <Toast.Body>{success}</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

function Charts({
    charts,
    // setCharts,
}: {
    charts: Chart[] | null;
    setCharts: setState<Chart[] | null>;
}) {
    return (
        <div className="d-flex gap-1 flex-column">
            {charts?.map((chart) => (
                <Card key={chart.id} className="mb-3" style={{ backgroundColor: ChartColorMap[chart.type] }}>
                    <Card.Body>
                        <Card.Title>{chart.name}</Card.Title>
                        <Card.Text>
                            <strong>Type:</strong> {chart.type}
                            <br />
                            <strong>Created At:</strong> {new Date(chart.createdAt).toLocaleString()}
                        </Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </div>
    );
}

function CreateChartButton({
    setError,
    setCharts,
    charts,
    setSuccess,
    navigate,
}: {
    setError: setError;
    navigate: NavigateFunction;
    setCharts: setState<Chart[]>;
    charts: Chart[];
    setSuccess: setState<string>;
}) {
    const [show, setShow] = useState(false);

    async function handleSubmit(values: { name: string; type: ChartType }) {
        try {
            const res = await axios.post<{ id: string }>('/Api/Charts', values);

            setCharts([
                {
                    id: res.data.id,
                    name: values.name,
                    type: values.type,
                    createdAt: new Date(),
                },
                ...charts
            ]);

            setSuccess('Created a chart.');
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
            <Button variant="primary" onClick={() => setShow(true)}>
                Create
            </Button>

            <Formik
                validationSchema={yup.object().shape({
                    name: yup
                        .string()
                        .min(1, 'Must be at least 1 character.')
                        .max(50, 'Cannot be more than 50 characters.')
                        .required('Name is required'),
                    type: yup.string().oneOf(Object.keys(ChartType)).required('Type is required.'),
                })}
                validateOnChange
                initialValues={{
                    name: '',
                    type: ChartType.Counter,
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
                                <Modal.Title>Create a chart?</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <Row className="mb-3">
                                    <FormGroup as={Col} controlId="nameId">
                                        <FormLabel>Name</FormLabel>
                                        <InputGroup hasValidation>
                                            <FormControl
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
                                {/* <Row className="mb-3">
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
                                </Row> */}
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="submit">Create</Button>
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
