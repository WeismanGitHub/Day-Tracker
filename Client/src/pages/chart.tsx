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
    notes: string;
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
            {chart && (
                <div className="full-height-minus-navbar">
                    <ChartBreadCrumbs chart={chart} setYear={setYear} year={year} years={years} />
                    <div className="p-0 m-0" style={{ height: 'fit-content', width: '100%' }}>
                        <SettingsPanel
                            setSettings={setSettings}
                            setSuccess={setSuccess}
                            settings={settings}
                        />
                        <CalendarHeatmap
                            entries={entries}
                            settings={settings}
                            year={year}
                            chart={chart}
                            setEntries={setEntries}
                            setError={setError}
                            setSuccess={setSuccess}
                        />
                        <ColorScale />
                    </div>
                </div>
            )}

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
}

function ChartBreadCrumbs({
    chart,
    year,
    years,
    setYear,
}: {
    chart: Chart;
    year: number;
    years: number[];
    setYear: setState<number>;
}) {
    const navigate = useNavigate();

    return (
        <h4 className="ps-4 pe-4 pt-2 w-100" style={{ height: '50px' }}>
            <Dropdown>
                <Breadcrumb>
                    <Breadcrumb.Item
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/');
                        }}
                    >
                        Home
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        href={`/charts/${chart.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/charts/${chart.id}`);
                        }}
                    >
                        {chart?.name}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        href={`/charts/${chart.id}?year=${year}`}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(`/charts/${chart.id}?year=${year}`);
                        }}
                    >
                        {year}
                    </Breadcrumb.Item>
                    <Dropdown.Toggle
                        style={{ padding: '0px 7.5px 0px 5px', border: 0 }}
                        variant="none"
                        id="dropdown-basic"
                    ></Dropdown.Toggle>
                </Breadcrumb>
                <Dropdown.Menu>
                    {years.map((y) => (
                        <Dropdown.Item
                            onClick={() => {
                                window.history.pushState('', '', `/charts/${chart.id}?year=${y}`);
                                setYear(y);
                            }}
                        >
                            {y}
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
        <div className="mx-auto" style={{ paddingBottom: '10px', paddingTop: '10px', width: 'fit-content' }}>
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

function SettingsPanel({
    settings,
    setSettings,
    setSuccess,
}: {
    setSuccess: setState<string>;
    settings: CalendarSettings;
    setSettings: setState<CalendarSettings>;
}) {
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

    setTimeout(() => {
        const calendar = document.querySelector('rect');

        if (calendar) {
            calendar.style.cursor = 'default';
        }

        const x = document.querySelectorAll(`rect`)[15];

        if (x) {
            x.style.borderColor = 'red';
            x.style.borderWidth = '1px';
        }
    }, 250);

    return (
        <>
            <EntryModal
                day={day}
                setDay={setDay}
                chart={chart}
                entries={entries}
                setEntries={setEntries}
                setError={setError}
                setSuccess={setSuccess}
            />
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
                        margin={{ top: 40, right: 50, bottom: 2, left: 50 }}
                        monthBorderColor="#9cc3ff"
                        monthBorderWidth={settings.outlineMonths ? 2 : 0}
                        yearSpacing={0}
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

const notesSchema = yup.string().max(500, 'Notes cannot be more than 500 characters.');

function validateField(schema: yup.Schema, input: unknown): boolean {
    try {
        schema.validateSync(input);
        return true;
    } catch (err) {
        return false;
    }
}

function getYupError(schema: yup.Schema, input: unknown): string {
    try {
        schema.validateSync(input);
        return '';
    } catch (err) {
        // @ts-expect-error It's of type yup.ValidationError.
        return err.message;
    }
}

function EntryModal({
    day,
    setDay,
    chart,
    entries,
    setEntries,
    setError,
    setSuccess,
}: {
    entries: Entry[];
    chart: Chart;
    day: Day | null;
    setDay: setState<Day | null>;
    setEntries: setState<Entry[]>;
    setSuccess: setState<string>;
    setError: setError;
}) {
    const entry = entries.find((entry) => entry.day === day?.day);

    const valueSchema = (() => {
        let schema = yup.number().typeError('Must be a number.').required('A value is required.');

        switch (chart.type) {
            case ChartType.Checkmark:
                schema = schema.min(0).max(1);
                break;
            case ChartType.Counter:
                break;
            case ChartType.Scale:
                schema = schema.min(1).max(10);
                break;
            default:
                throw new Error('Invalid Chart Type');
        }

        return schema;
    })();

    return entry ? (
        <ModifyEntry
            valueSchema={valueSchema}
            chart={chart}
            day={day}
            entries={entries}
            setDay={setDay}
            setEntries={setEntries}
            setError={setError}
            setSuccess={setSuccess}
        />
    ) : (
        <CreateEntry
            valueSchema={valueSchema}
            chart={chart}
            day={day}
            entries={entries}
            setDay={setDay}
            setEntries={setEntries}
            setError={setError}
            setSuccess={setSuccess}
        />
    );
}

function CreateEntry({
    valueSchema,
    setSuccess,
    setDay,
    setEntries,
    setError,
    entries,
    day,
    chart,
}: {
    valueSchema: yup.NumberSchema;
    entries: Entry[];
    chart: Chart;
    setError: setError;
    setEntries: setState<Entry[]>;
    setSuccess: setState<string>;
    day: Day | null;
    setDay: setState<Day | null>;
}) {
    // This is kinda hacky but necessary because setError/setSuccess cause the component to re-render and reset the values.
    const [value, setValue] = useState<string>('1');
    const [notes, setNotes] = useState('');
    const navigate = useNavigate();

    return (
        <Formik
            validationSchema={yup.object()}
            validateOnChange
            initialValues={{}}
            onSubmit={async () => {
                if (!validateField(valueSchema, value) || !validateField(notesSchema, notes)) {
                    return;
                }

                await handleErrors(
                    async () => {
                        const res = await axios.post<{ id: string }>(`/Api/Charts/${chart.id}/Entries`, {
                            date: day?.date,
                            value,
                            notes,
                        });

                        setSuccess('Created Entry');
                        setDay(null);
                        setEntries([...entries, { id: res.data.id, notes, value, day: day?.day }]);
                    },
                    setError,
                    navigate
                );
            }}
        >
            {({ handleSubmit }) => {
                const valueInput = (() => {
                    switch (chart.type) {
                        case ChartType.Checkmark:
                            return (
                                <Form.Check
                                    checked={Number(value) === 1}
                                    onClick={() => setValue(String(Number(value) === 0 ? 1 : 0))}
                                    value={value}
                                    reverse={true}
                                    name="value"
                                    inline={true}
                                    type="switch"
                                    autoFocus
                                />
                            );
                        default:
                            return (
                                <FormControl
                                    aria-describedby="inputGroupPrepend"
                                    name="value"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    isInvalid={!validateField(valueSchema, value)}
                                    autoFocus
                                />
                            );
                    }
                })();

                return (
                    <Modal
                        show={day !== null}
                        centered
                        keyboard={true}
                        onHide={() => setDay(null)}
                        animation={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Entry for {day?.date.toLocaleString([], { dateStyle: 'short' })}
                            </Modal.Title>
                        </Modal.Header>
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Row className="mb-3">
                                    <FormGroup as={Col} controlId="ValueId">
                                        <FormLabel>Value</FormLabel>
                                        <InputGroup hasValidation>
                                            {valueInput}
                                            <FormControl.Feedback type="invalid">
                                                {getYupError(valueSchema, value)}
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    </FormGroup>
                                </Row>
                                <Row className="mb-3">
                                    <FormGroup as={Col} controlId="NotesId">
                                        <FormLabel>Notes</FormLabel>
                                        <InputGroup hasValidation>
                                            <FormControl
                                                as="textarea"
                                                aria-describedby="inputGroupPrepend"
                                                name="notes"
                                                rows={7}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                isInvalid={!validateField(notesSchema, notes)}
                                            />
                                            <FormControl.Feedback type="invalid">
                                                {getYupError(notesSchema, notes)}
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    </FormGroup>
                                </Row>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button type="submit">Create</Button>
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
}

function ModifyEntry({
    valueSchema,
    setSuccess,
    setDay,
    setEntries,
    setError,
    entries,
    day,
    chart,
}: {
    valueSchema: yup.NumberSchema;
    entries: Entry[];
    chart: Chart;
    setError: setError;
    setEntries: setState<Entry[]>;
    setSuccess: setState<string>;
    day: Day | null;
    setDay: setState<Day | null>;
}) {
    // This is kinda hacky but necessary because setError/setSuccess cause the component to re-render and reset the values.

    const entry = entries.find((entry) => entry.day === day?.day);
    const [value, setValue] = useState<string>(String(entry?.value ?? 0));
    const [notes, setNotes] = useState(entry?.notes ?? '');
    const navigate = useNavigate();

    if (!entry) {
        return <h2>Something went wrong!</h2>;
    }

    return (
        <Formik
            validationSchema={yup.object()}
            validateOnChange
            initialValues={{}}
            onSubmit={async () => {
                if (!validateField(valueSchema, value) || !validateField(notesSchema, notes)) {
                    return;
                }

                await handleErrors(
                    async () => {
                        const update: { value?: string; notes?: string } = {};

                        if (notes != entry.notes) {
                            update.notes = notes;
                        }

                        if (value != String(entry.value)) {
                            update.value = value;
                        }

                        await axios.patch(`/Api/Charts/${chart.id}/Entries/${entry.id}`, update);

                        setSuccess('Updated Entry');
                        setDay(null);
                        setEntries(
                            entries.map((e) => {
                                if (e.id === entry.id) {
                                    e.notes = notes;
                                    e.value = Number(value);
                                }

                                return e;
                            })
                        );
                    },
                    setError,
                    navigate
                );
            }}
        >
            {({ handleSubmit }) => {
                const valueInput = (() => {
                    switch (chart.type) {
                        case ChartType.Checkmark:
                            return (
                                <Form.Check
                                    checked={Number(value) === 1}
                                    onClick={() => setValue(String(Number(value) === 0 ? 1 : 0))}
                                    value={value}
                                    reverse={true}
                                    name="value"
                                    inline={true}
                                    type="switch"
                                    autoFocus
                                />
                            );
                        default:
                            return (
                                <FormControl
                                    aria-describedby="inputGroupPrepend"
                                    name="value"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    isInvalid={!validateField(valueSchema, value)}
                                    autoFocus
                                />
                            );
                    }
                })();

                return (
                    <Modal
                        show={day !== null}
                        centered
                        keyboard={true}
                        onHide={() => setDay(null)}
                        animation={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                Entry for {day?.date.toLocaleString([], { dateStyle: 'short' })}
                            </Modal.Title>
                        </Modal.Header>
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Body>
                                <Row className="mb-3">
                                    <FormGroup as={Col} controlId="ValueId">
                                        <FormLabel>Value</FormLabel>
                                        <InputGroup hasValidation>
                                            {valueInput}
                                            <FormControl.Feedback type="invalid">
                                                {getYupError(valueSchema, value)}
                                            </FormControl.Feedback>
                                        </InputGroup>
                                    </FormGroup>
                                </Row>
                                <Row className="mb-3">
                                    <FormGroup as={Col} controlId="NotesId">
                                        <FormLabel>Notes</FormLabel>
                                        <InputGroup hasValidation>
                                            <FormControl
                                                as="textarea"
                                                aria-describedby="inputGroupPrepend"
                                                name="notes"
                                                rows={7}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                isInvalid={!validateField(notesSchema, notes)}
                                            />
                                            <FormControl.Feedback type="invalid">
                                                {getYupError(notesSchema, notes)}
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
                );
            }}
        </Formik>
    );

    function DeleteButton() {
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
                    setSuccess('Deleted this entry.');

                    setEntries(entries.filter((entry) => entry.day !== day.day));
                },
                setError,
                navigate
            );
        }

        return (
            <Button variant="danger" onClick={deleteEntry}>
                Delete
            </Button>
        );
    }
}
