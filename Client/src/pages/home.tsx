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
    ListGroup,
    Dropdown,
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
    type: number;
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
                <div className="container mt-3 mb-3">
                    <Card style={{ maxWidth: '500px' }} className="mx-auto mb-2">
                        <Card.Header className="bg-primary text-white">
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
        <div className="d-flex gap-2 flex-wrap justify-content-center w-100">
            {charts?.map((chart) => (
                <a href={`/charts/${chart.id}`}>
                    <Card
                        key={chart.id}
                        style={{
                            width: '18rem',
                            backgroundColor: ChartColorMap[chart.type as ChartType],
                            cursor: 'pointer',
                        }}
                        className="shadow-sm chart"
                    >
                        <Card.Body>
                            <Card.Title style={{ display: 'flex', alignItems: 'center' }}>
                                <h4
                                    style={{
                                        paddingBottom: '3px',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        flexGrow: 1,
                                    }}
                                >
                                    <strong>{chart.name}</strong>
                                </h4>
                                <a
                                    href="#."
                                    style={{
                                        float: 'right',
                                        display: 'inline-block',
                                        paddingBottom: '15px',
                                    }}
                                >
                                    <div className="dropdown dropdown-menu-end">
                                        <div data-bs-toggle="dropdown" className="ms-auto">
                                            <img
                                                src="three-dots-vertical.svg"
                                                width="22.5"
                                                height="22.5"
                                                alt="options"
                                            />
                                        </div>

                                        <div className="dropdown-menu">
                                            <Dropdown.Item href={`/charts/${chart.id}`}>View</Dropdown.Item>
                                            <Dropdown.Item>Edit</Dropdown.Item>
                                            <Dropdown.Item>Delete</Dropdown.Item>
                                        </div>
                                    </div>
                                </a>
                            </Card.Title>
                            <Card.Text>
                                <strong>Type:</strong> {ChartType[chart.type]}
                            </Card.Text>
                            <Card.Text>
                                <strong>Created:</strong>{' '}
                                {new Date(chart.createdAt).toLocaleString([], { dateStyle: 'short' })}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </a>
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
                ...charts,
            ]);

            values.name = '';
            setShow(false);
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
                {({ handleSubmit, handleChange, values, errors, setFieldValue }) => (
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
                                <Row className="mb-3">
                                    <FormGroup as={Col}>
                                        <FormLabel>Chart Type</FormLabel>
                                        <br />
                                        <ListGroup horizontal={true}>
                                            <ListGroup.Item
                                                action
                                                active={values.type == ChartType.Counter}
                                                className="text-black"
                                                style={{
                                                    backgroundColor: ChartColorMap[0],
                                                    fontWeight:
                                                        values.type === ChartType.Counter ? 'bold' : 'normal',
                                                }}
                                                onClick={() => setFieldValue('type', ChartType.Counter)}
                                            >
                                                Counter
                                            </ListGroup.Item>
                                            <ListGroup.Item
                                                action
                                                active={values.type == ChartType.CheckMark}
                                                className="text-black"
                                                style={{
                                                    backgroundColor: ChartColorMap[1],
                                                    fontWeight:
                                                        values.type === ChartType.CheckMark
                                                            ? 'bold'
                                                            : 'normal',
                                                }}
                                                onClick={() => setFieldValue('type', ChartType.CheckMark)}
                                            >
                                                Checkmark
                                            </ListGroup.Item>
                                            <ListGroup.Item
                                                action
                                                active={values.type == ChartType.Scale}
                                                className="text-black"
                                                style={{
                                                    backgroundColor: ChartColorMap[2],
                                                    fontWeight:
                                                        values.type === ChartType.Scale ? 'bold' : 'normal',
                                                }}
                                                onClick={() => setFieldValue('type', ChartType.Scale)}
                                            >
                                                Scale
                                            </ListGroup.Item>
                                        </ListGroup>
                                        <FormControl.Feedback type="invalid">
                                            {errors.type}
                                        </FormControl.Feedback>
                                    </FormGroup>
                                </Row>
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
