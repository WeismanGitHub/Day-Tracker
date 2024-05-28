import { Form, useNavigate } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { ChartType, handleErrors } from '../helpers';
import Tooltip from 'react-bootstrap/Tooltip';
import { useEffect, useState } from 'react';
import { chartSchema } from '../schemas';
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

const ChartColorMap = {
    [ChartType.Counter]: '#CDABEB',
    [ChartType.Checkmark]: '#C1EBC0',
    [ChartType.Scale]: '#F09EA7',
};

const chartsSchema = yup.array(chartSchema);

const chartNameSchema = yup
    .string()
    .min(1, 'Must be at least 1 character.')
    .max(50, 'Cannot be more than 50 characters.')
    .required('Name is required');

export default function Home() {
    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [charts, setCharts] = useState<Chart[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        handleErrors(
            async () => {
                const res = await axios.get<Chart[]>('/Api/Charts');

                if (!chartsSchema.validateSync(res.data)) {
                    throw new Error();
                }

                setCharts(res.data);
            },
            setError,
            navigate
        );
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
                                    <CreateChartButton />
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Charts />
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
                    onClose={() => setSuccess(null)}
                    show={success !== null}
                    autohide={true}
                    className="d-inline-block m-1"
                    bg={'success'}
                >
                    <Toast.Header>
                        <strong className="me-auto">{'Success!'}</strong>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        <strong>{success}</strong>
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );

    function Charts() {
        return (
            <div className="d-flex gap-2 flex-wrap justify-content-center w-100 pb-3">
                {charts?.map((chart) => (
                    <a href={`/charts/${chart.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
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
                                        <OverlayTrigger
                                            overlay={<Tooltip id={chart.id}>{chart.name}</Tooltip>}
                                        >
                                            <strong>{chart.name}</strong>
                                        </OverlayTrigger>
                                    </h4>
                                    <div
                                        onClick={(e) => e.preventDefault()}
                                        style={{
                                            float: 'right',
                                            display: 'inline-block',
                                            paddingBottom: '15px',
                                        }}
                                    >
                                        <div className="dropdown dropdown-menu-end">
                                            <div
                                                data-bs-toggle="dropdown"
                                                className="ms-auto"
                                                style={{ padding: '5px', margin: '-5px' }}
                                            >
                                                <img
                                                    src="three-dots-vertical.svg"
                                                    width="22.5"
                                                    height="22.5"
                                                    alt="options"
                                                />
                                            </div>

                                            <div className="dropdown-menu">
                                                <Dropdown.Item
                                                    href={`/charts/${chart.id}`}
                                                    onClick={() => navigate(`/charts/${chart.id}`)}
                                                >
                                                    View
                                                </Dropdown.Item>
                                                <EditChartItem chart={chart} />
                                                <DeleteChartItem chartId={chart.id} />
                                            </div>
                                        </div>
                                    </div>
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

    function EditChartItem({ chart }: { chart: Chart }) {
        const [show, setShow] = useState(false);
        const navigate = useNavigate();

        async function updateChart(name: string) {
            await handleErrors(
                async () => {
                    await axios.patch(`/Api/Charts/${chart.id}`, { name });
                    setCharts(
                        charts.map((c) => {
                            if (c.id === chart.id) {
                                c.name = name;
                            }

                            return c;
                        })
                    );

                    setShow(false);
                    setSuccess('Updated this chart.');
                },
                setError,
                navigate
            );
        }

        return (
            <>
                <Dropdown.Item onClick={() => setShow(true)}>Edit</Dropdown.Item>

                <Formik
                    validationSchema={yup.object().shape({
                        name: chartNameSchema,
                    })}
                    validateOnMount
                    validateOnChange
                    initialValues={{
                        name: chart.name,
                    }}
                    onSubmit={(values) => updateChart(values.name)}
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
                                    <Modal.Title>Update this chart?</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Row className="mb-3">
                                        <FormGroup as={Col} controlId="NameId">
                                            <FormLabel>New Name</FormLabel>
                                            <InputGroup hasValidation>
                                                <FormControl
                                                    autoFocus
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
        );
    }

    function DeleteChartItem({ chartId }: { chartId: string }) {
        const [show, setShow] = useState(false);
        const navigate = useNavigate();

        async function deleteChart() {
            await handleErrors(
                async () => {
                    await axios.delete(`/Api/Charts/${chartId}`);
                    setCharts(charts.filter((chart) => chart.id !== chartId));

                    setShow(false);
                    setSuccess('Deleted this chart.');
                },
                setError,
                navigate
            );
        }

        return (
            <>
                <Dropdown.Item onClick={() => setShow(true)}>Delete</Dropdown.Item>

                <Modal show={show} centered keyboard={true} onHide={() => setShow(false)} animation={false}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete this chart?</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="danger" onClick={deleteChart}>
                            Delete
                        </Button>
                        <Button variant="secondary" onClick={() => setShow(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

    function CreateChartButton() {
        const [show, setShow] = useState(false);

        async function handleSubmit(values: { name: string; type: ChartType }) {
            await handleErrors(
                async () => {
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
                },
                setError,
                navigate
            );
        }

        return (
            <>
                <Button variant="primary" onClick={() => setShow(true)}>
                    Create
                </Button>

                <Formik
                    validationSchema={yup.object().shape({
                        name: chartNameSchema,
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
                                                    autoFocus
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
                                                            values.type === ChartType.Counter
                                                                ? 'bold'
                                                                : 'normal',
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFieldValue('type', ChartType.Counter);
                                                    }}
                                                >
                                                    Counter
                                                </ListGroup.Item>
                                                <ListGroup.Item
                                                    action
                                                    active={values.type == ChartType.Checkmark}
                                                    className="text-black"
                                                    style={{
                                                        backgroundColor: ChartColorMap[1],
                                                        fontWeight:
                                                            values.type === ChartType.Checkmark
                                                                ? 'bold'
                                                                : 'normal',
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFieldValue('type', ChartType.Checkmark);
                                                    }}
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
                                                            values.type === ChartType.Scale
                                                                ? 'bold'
                                                                : 'normal',
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFieldValue('type', ChartType.Scale);
                                                    }}
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
}
