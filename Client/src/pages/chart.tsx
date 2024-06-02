import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChartType, handleErrors } from '../helpers';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useEffect, useState } from 'react';
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
    value: number;
    notes?: string;
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
                const chartRes = await axios.get<Chart>(`/Api/Charts/${chartId}`);

                if (!chartSchema.validateSync(chartRes.data)) {
                    throw new Error();
                }

                setChart(chartRes.data);
            },
            setError,
            navigate
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        handleErrors(
            async () => {
                const entriesRes = await axios.get<Entry[]>(`/Api/Charts/${chartId}/Entries?year=${year}`);
                setEntries(entriesRes.data);
            },
            setError,
            navigate
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year]);

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

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar">
                <ChartBreadCrumbs />
                <div className="container">
                    <SettingsPanel />
                    <div className="mx-auto">
                        {chart && (
                            <CalendarHeatmap
                                entries={entries}
                                settings={settings}
                                year={year}
                                chart={chart}
                                setEntries={setEntries}
                                setError={setError}
                                setSuccess={setSuccess}
                            />
                        )}
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
                            <Dropdown.Item
                                onClick={() => {
                                    window.history.pushState('', '', `/charts/${chartId}?year=${year}`);
                                    setYear(year);
                                }}
                            >
                                {year}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </h4>
        );
    }

    function ColorScale() {
        const squareSize = window.innerWidth < 405 ? 21 : 30;

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
}

function CalendarHeatmap({
    settings,
    entries,
    year,
    setError,
    setEntries,
    setSuccess,
    chart,
}: {
    settings: CalendarSettings;
    entries: Entry[];
    year: number;
    setError: setState<CustomError>;
    setEntries: setState<Entry[]>;
    setSuccess: setState<string>;
    chart: Chart;
}) {
    const [day, setDay] = useState<Day | null>(null);
    const navigate = useNavigate();

    setTimeout(() => {
        const calendar = document.querySelector('rect');

        if (calendar) {
            calendar.style.cursor = 'default';
        }
    }, 250);

    return (
        <>
            <EntryModal day={day} setDay={setDay} />
            <div
                style={{
                    textAlign: 'center',
                    overflowX: 'auto',
                    overflowY: 'hidden',
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
                            return { day: e.day, value: e.value };
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

    function EntryModal({ day, setDay }: { day: Day | null; setDay: setState<Day | null> }) {
        const entry = entries.find((entry) => entry.day === day?.day);

        return <>{entry ? <CreateEntry /> : <ModifyEntry />}</>;

        function CreateEntry() {
            const entry = entries.find((entry) => entry.day === day?.day);
            console.log(entry);

            return (
                <Formik
                    validationSchema={yup.object().shape({
                        value: yup.number().required('A value is required.'),
                        notes: yup
                            .string()
                            .required('Notes are required.')
                            .max(500, 'Notes cannot be more than 500 characters.'),
                    })}
                    validateOnMount
                    validateOnChange
                    initialValues={{
                        value: entry?.value ?? 0,
                        notes: entry?.notes ?? '',
                    }}
                    onSubmit={async (values) => {
                        await handleErrors(
                            async () => {
                                await axios.post(`/Api/Charts/${chart.id}/Entries`, {
                                    date: day?.date,
                                    value: values.value,
                                    // notes: values.notes
                                });

                                setSuccess('Updated Entry');
                            },
                            setError,
                            navigate
                        );
                    }}
                >
                    {({ handleSubmit, handleChange, values, errors }) => {
                        function ValueInput() {
                            switch (chart?.type) {
                                case ChartType.Checkmark:
                                    break;
                                default:
                                    break;
                            }
                            // <InputGroup hasValidation>
                            //                     <FormControl
                            //                         autoFocus
                            //                         aria-describedby="inputGroupPrepend"
                            //                         name="name"
                            //                         value={values.value}
                            //                         onChange={handleChange}
                            //                         isInvalid={!!errors.value}
                            //                     />
                            //                     <FormControl.Feedback type="invalid">
                            //                         {errors.value}
                            //                     </FormControl.Feedback>
                            //                 </InputGroup>
                            return <></>;
                        }

                        return (
                            <Modal
                                show={day !== null}
                                centered
                                keyboard={true}
                                onHide={() => setDay(null)}
                                animation={false}
                            >
                                <Form noValidate onSubmit={handleSubmit}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Entry for {day?.day}</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Row className="mb-3">
                                            <FormGroup as={Col} controlId="NotesId">
                                                <FormLabel>Notes</FormLabel>
                                                <InputGroup hasValidation>
                                                    <FormControl
                                                        autoFocus
                                                        aria-describedby="inputGroupPrepend"
                                                        name="notes"
                                                        value={values.notes}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.notes}
                                                    />
                                                    <FormControl.Feedback type="invalid">
                                                        {errors.notes}
                                                    </FormControl.Feedback>
                                                </InputGroup>
                                            </FormGroup>
                                        </Row>
                                        <Row className="mb-3">
                                            <FormGroup as={Col} controlId="NameId">
                                                <FormLabel>Value</FormLabel>
                                                <ValueInput />
                                            </FormGroup>
                                        </Row>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button type="submit" variant="warning">
                                            Update
                                        </Button>
                                        <ClearButton />
                                        <Button variant="secondary" onClick={() => setDay(null)}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Form>
                            </Modal>
                        );
                    }}
                </Formik>
            );

            function ClearButton() {
                async function deleteEntry() {
                    if (!day) return;

                    await handleErrors(
                        async () => {
                            await axios.delete(`/Api/Charts/${chart.id}/Entries`, {
                                data: {
                                    date: day.date,
                                },
                            });

                            setDay(null);
                            setSuccess('Cleared this entry.');

                            setEntries(entries.filter((entry) => entry.day !== day.day));
                        },
                        setError,
                        navigate
                    );
                }

                return (
                    <Button variant="danger" onClick={deleteEntry}>
                        Clear
                    </Button>
                );
            }
        }

        function ModifyEntry() {
            const entry = entries.find((entry) => entry.day === day?.day);
            console.log(entry);

            return (
                <Formik
                    validationSchema={yup.object().shape({
                        value: yup.number().required('A value is required.'),
                        notes: yup
                            .string()
                            .required('Notes are required.')
                            .max(500, 'Notes cannot be more than 500 characters.'),
                    })}
                    validateOnMount
                    validateOnChange
                    initialValues={{
                        value: entry?.value ?? 0,
                        notes: entry?.notes ?? '',
                    }}
                    onSubmit={async (values) => {
                        await handleErrors(
                            async () => {
                                await axios.post(`/Api/Charts/${chart.id}/Entries`, {
                                    date: day?.date,
                                    value: values.value,
                                    // notes: values.notes
                                });

                                setSuccess('Updated Entry');
                            },
                            setError,
                            navigate
                        );
                    }}
                >
                    {({ handleSubmit, handleChange, values, errors }) => {
                        function ValueInput() {
                            switch (chart?.type) {
                                case ChartType.Checkmark:
                                    break;
                                default:
                                    break;
                            }
                            // <InputGroup hasValidation>
                            //                     <FormControl
                            //                         autoFocus
                            //                         aria-describedby="inputGroupPrepend"
                            //                         name="name"
                            //                         value={values.value}
                            //                         onChange={handleChange}
                            //                         isInvalid={!!errors.value}
                            //                     />
                            //                     <FormControl.Feedback type="invalid">
                            //                         {errors.value}
                            //                     </FormControl.Feedback>
                            //                 </InputGroup>
                            return <></>;
                        }

                        return (
                            <Modal
                                show={day !== null}
                                centered
                                keyboard={true}
                                onHide={() => setDay(null)}
                                animation={false}
                            >
                                <Form noValidate onSubmit={handleSubmit}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Entry for {day?.day}</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Row className="mb-3">
                                            <FormGroup as={Col} controlId="NotesId">
                                                <FormLabel>Notes</FormLabel>
                                                <InputGroup hasValidation>
                                                    <FormControl
                                                        autoFocus
                                                        aria-describedby="inputGroupPrepend"
                                                        name="notes"
                                                        value={values.notes}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.notes}
                                                    />
                                                    <FormControl.Feedback type="invalid">
                                                        {errors.notes}
                                                    </FormControl.Feedback>
                                                </InputGroup>
                                            </FormGroup>
                                        </Row>
                                        <Row className="mb-3">
                                            <FormGroup as={Col} controlId="NameId">
                                                <FormLabel>Value</FormLabel>
                                                <ValueInput />
                                            </FormGroup>
                                        </Row>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button type="submit" variant="warning">
                                            Update
                                        </Button>
                                        <ClearButton />
                                        <Button variant="secondary" onClick={() => setDay(null)}>
                                            Close
                                        </Button>
                                    </Modal.Footer>
                                </Form>
                            </Modal>
                        );
                    }}
                </Formik>
            );

            function ClearButton() {
                async function deleteEntry() {
                    if (!day) return;

                    await handleErrors(
                        async () => {
                            await axios.delete(`/Api/Charts/${chart.id}/Entries`, {
                                data: {
                                    date: day.date,
                                },
                            });

                            setDay(null);
                            setSuccess('Cleared this entry.');

                            setEntries(entries.filter((entry) => entry.day !== day.day));
                        },
                        setError,
                        navigate
                    );
                }

                return (
                    <Button variant="danger" onClick={deleteEntry}>
                        Clear
                    </Button>
                );
            }
        }
    }
}
