import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useEffect, useState } from 'react';
import { handleErrors } from '../helpers';
import { chartSchema } from '../schemas';
import { Formik } from 'formik';
import NavBar from '../navbar';
import * as yup from 'yup';
import axios from 'axios';
import {
    Breadcrumb,
    Button,
    ButtonGroup,
    Card,
    Col,
    Dropdown,
    Form,
    FormControl,
    FormGroup,
    FormLabel,
    InputGroup,
    Modal,
    Row,
    Toast,
    ToastContainer,
    ToggleButton,
} from 'react-bootstrap';

interface Entry {
    id: string;
    day: string;
    rating?: number;
    count?: number;
    checked?: boolean;
}

type Day = {
    color: string;
    date: Date;
    day: string;
    size: number;
    x: number;
    y: number;
};

type CalendarSettings = {
    outlineMonths: boolean;
    direction: 'vertical' | 'horizontal';
};

function getYear(paramsYear: string | null): number {
    const currentYear = new Date().getFullYear();
    const castYear = paramsYear ? Number(paramsYear) : currentYear;

    return Number.isNaN(castYear) ? currentYear : castYear;
}

export default function Chart() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [chart, setChart] = useState<Chart | null>(null);
    const { chartId } = useParams();
    const navigate = useNavigate();

    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const [year, setYear] = useState<number>(getYear(searchParams.get('year')));

    // Validate the year.
    if (chart && year < new Date(chart.createdAt).getFullYear()) {
        setYear(new Date().getFullYear());
    }

    const [settings, setSettings] = useState<CalendarSettings>({
        outlineMonths: Boolean(localStorage.getItem('outlineMonths')),
        direction: localStorage.getItem('direction') ? 'vertical' : 'horizontal',
    });

    useEffect(() => {
        handleErrors(
            async () => {
                const [chartRes, entriesRes] = await Promise.all([
                    axios.get<Chart>(`/Api/Charts/${chartId}`),
                    axios.get<Entry[]>(`/Api/Charts/${chartId}/Entries?year=${year}`),
                ]);

                if (!chartSchema.validateSync(chartRes.data)) {
                    throw new Error();
                }

                setEntries(entriesRes.data);
                setChart(chartRes.data);
            },
            setError,
            navigate
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const years = (() => {
        if (!chart) {
            return [];
        }

        let currentYear = new Date().getFullYear();
        const years: number[] = [];

        while (currentYear >= new Date(chart.createdAt).getFullYear()) {
            years.push(currentYear);
            currentYear--;
        }

        return years;
    })();

    const squareSize = window.innerWidth < 405 ? 21 : 30;
    const colors = [
        '#8080ff',
        '#6666ff',
        '#4d4dff',
        '#3333ff',
        '#1a1aff',
        '#0000ff',
        '#0000e6',
        '#0000cc',
        '#0000b3',
        '#000099',
    ];

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar">
                <ChartBreadCrumbs />
                <div className="container">
                    <SettingsPanel />
                    <div className="mx-auto">
                        <CalendarHeatmap />
                    </div>
                    <ColorScale />
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

    function ChartBreadCrumbs() {
        return (
            <h4 className="ps-4 pe-4 pt-2 pb-5 w-100" style={{ height: '50px' }}>
                <Dropdown>
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/charts/${chartId}`}>{chart?.name}</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/charts/${chartId}?year=${year}`}>{year}</Breadcrumb.Item>
                        <Dropdown.Toggle
                            style={{ padding: '0px 7.5px 0px 5px', border: 0 }}
                            variant="none"
                            id="dropdown-basic"
                        ></Dropdown.Toggle>
                    </Breadcrumb>
                    <Dropdown.Menu>
                        {years.map((year) => (
                            <Dropdown.Item href={`/charts/${chartId}?year=${year}`}>{year}</Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </h4>
        );
    }

    function ColorScale() {
        return (
            <div
                className="mx-auto"
                style={{ paddingBottom: '10px', paddingTop: '10px', width: 'fit-content' }}
            >
                Less
                <svg
                    height={squareSize}
                    width={colors.length * squareSize}
                    style={{ cursor: 'default', borderRadius: '5px' }}
                    className="me-2 ms-2"
                >
                    {colors.map((color, index) => (
                        <rect
                            height={squareSize}
                            width={squareSize}
                            y="0"
                            x={index * squareSize}
                            style={{
                                cursor: 'default',
                                fill: color,
                            }}
                        ></rect>
                    ))}
                </svg>
                More
            </div>
        );
    }

    function SettingsPanel() {
        return (
            <Card style={{ maxWidth: '500px' }} className="mx-auto mb-2 mt-2">
                <Card.Header className="bg-primary text-white">
                    <h2>Calendar Settings</h2>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col>
                            <Card.Text>
                                <div className="d-flex justify-content-center align-content-center flex-wrap">
                                    <Form>
                                        <Form.Check
                                            checked={settings.outlineMonths}
                                            onClick={() => {
                                                if (!settings.outlineMonths) {
                                                    localStorage.setItem('outlineMonths', 'true');
                                                } else {
                                                    localStorage.removeItem('outlineMonths');
                                                }

                                                setSettings({
                                                    outlineMonths: !settings.outlineMonths,
                                                    direction: settings.direction,
                                                });
                                            }}
                                            reverse={true}
                                            inline={true}
                                            type="switch"
                                            label="Show Month Borders"
                                        />
                                    </Form>
                                    <div className="w-100"></div>
                                    <ButtonGroup className="mt-2">
                                        <ToggleButton
                                            id="horizontal"
                                            type="radio"
                                            name="radio"
                                            value={'horizontal'}
                                            checked={settings.direction === 'horizontal'}
                                            onChange={() => {
                                                localStorage.removeItem('direction');
                                                setSettings({
                                                    direction: 'horizontal',
                                                    outlineMonths: settings.outlineMonths,
                                                });
                                            }}
                                            style={{ width: '100px' }}
                                        >
                                            Horizontal
                                        </ToggleButton>
                                        <ToggleButton
                                            id="vertical"
                                            type="radio"
                                            name="radio"
                                            value={'vertical'}
                                            checked={settings.direction === 'vertical'}
                                            onChange={() => {
                                                localStorage.setItem('direction', 'vertical');
                                                setSettings({
                                                    direction: 'vertical',
                                                    outlineMonths: settings.outlineMonths,
                                                });
                                            }}
                                            style={{ width: '100px' }}
                                        >
                                            Vertical
                                        </ToggleButton>
                                    </ButtonGroup>
                                </div>
                            </Card.Text>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col className="d-flex justify-content-center">
                            <Button
                                onClick={() => {
                                    localStorage.removeItem('outlineMonths');
                                    localStorage.removeItem('direction');

                                    setSettings({
                                        direction: 'horizontal',
                                        outlineMonths: false,
                                    });

                                    setSuccess('Reset calendar settings.');
                                }}
                                variant="warning"
                            >
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    }

    function CalendarHeatmap() {
        const [day, setDay] = useState<Day | null>(null);

        setTimeout(() => {
            const calendar = document.querySelector('rect');

            if (calendar) {
                calendar.style.cursor = 'default';
            }
        }, 250);

        return (
            <>
                <ModifyEntry day={day} setDay={setDay} />
                <div
                    style={{
                        textAlign: 'center',
                        overflowX: 'auto',
                        overflowY: 'hidden'
                    }}
                >
                    <div
                        style={{
                            minWidth: settings.direction === 'horizontal' ? '725px' : '295px',
                            height: settings.direction === 'vertical' ? '1500px' : '175px',
                        }}
                    >
                        <ResponsiveCalendar
                            data={entries.map((e) => {
                                const value = e.checked !== null ? Number(e.checked) : e.count ?? e.rating;

                                return { day: e.day, value: value ?? 0 };
                            })}
                            theme={{ labels: { text: { fontSize: 'large' } } }}
                            from={new Date(year, 0, 1, 0, 0, 0, 0)}
                            to={new Date(year, 11, 31, 23, 59, 59, 999)}
                            emptyColor="#eeeeee"
                            direction={settings.direction}
                            colors={colors}
                            margin={{ top: 40, right: 40, bottom: 2, left: 40 }}
                            monthBorderColor="#9cc3ff"
                            monthBorderWidth={settings.outlineMonths ? 2 : 0}
                            yearSpacing={0}
                            dayBorderWidth={2}
                            dayBorderColor="#ffffff"
                            legends={[
                                {
                                    anchor: 'bottom-right',
                                    direction: 'row',
                                    translateY: 36,
                                    itemCount: 4,
                                    itemWidth: 42,
                                    itemHeight: 36,
                                    itemsSpacing: 14,
                                    itemDirection: 'right-to-left',
                                },
                            ]}
                            onClick={(data) => setDay(data)}
                        />
                    </div>
                </div>
            </>
        );
    }

    // function createValueSchema(): yup.Schema {

    // }

    function ModifyEntry({ day, setDay }: { day: Day | null; setDay: setState<Day | null> }) {
        // const valueSchema = chart!.type == ChartType.Checkmark ? yup.boolean() : yup.number();
        // valueSchema.required('A value is required.')

        // if (ChartType[chart?.type] == ChartType.Counter) {
        //     valueSchema
        // }

        async function updateEntry(value: number) {
            console.log(value);
            await handleErrors(
                async () => {
                    await axios.delete(`/Api/Charts/${chartId}/Entries/${'dhjfkshjdfs'}`);
                    setSuccess('Deleted this chart.');
                },
                setError,
                navigate
            );
        }

        return (
            <Formik
                validationSchema={yup.object().shape({
                    // value: createValueSchema(),
                })}
                validateOnMount
                validateOnChange
                initialValues={{
                    value: 0,
                }}
                onSubmit={(values) => updateEntry(values.value)}
            >
                {({ handleSubmit, handleChange, values, errors }) => (
                    <Modal
                        show={day !== null}
                        centered
                        keyboard={true}
                        onHide={() => setDay(null)}
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
                                                value={values.value}
                                                onChange={handleChange}
                                                isInvalid={!!errors.value}
                                            />
                                            <FormControl.Feedback type="invalid">
                                                {errors.value}
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    </FormGroup>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="submit" variant="warning">
                                    Update
                                </Button>
                                <DeleteButton />
                                <Button variant="secondary" onClick={() => setDay(null)}>
                                    Close
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                )}
            </Formik>
        );

        function DeleteButton() {
            const [show, setShow] = useState(false);

            async function deleteEntry() {
                await handleErrors(
                    async () => {
                        await axios.delete(`/Api/Charts/${chartId}/Entries/${'dhjfkshjdfs'}`);
                        setDay(null);

                        setShow(false);
                        setSuccess('Deleted this chart.');
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

                    <Modal
                        show={show}
                        centered
                        keyboard={true}
                        onHide={() => setShow(false)}
                        animation={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Delete the entry for this day?</Modal.Title>
                        </Modal.Header>
                        <Modal.Footer>
                            <Button variant="danger" onClick={deleteEntry}>
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
    }
}
