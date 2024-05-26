import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useEffect, useState } from 'react';
import { handleErrors } from '../helpers';
import { chartSchema } from '../schemas';
import NavBar from '../navbar';
import axios from 'axios';
import {
    Breadcrumb,
    Button,
    ButtonGroup,
    Card,
    Col,
    Dropdown,
    Form,
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

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar d-flex justify-content-center flex-wrap">
                <h4 className="ps-4 pt-2 w-100" style={{ height: '50px' }}>
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
                <div className="container">
                    <Card style={{ maxWidth: '500px' }} className="mx-auto mb-2 mt-2">
                        <Card.Header className="bg-primary text-white">
                            <h2>Calendar Settings</h2>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col>
                                    <Card.Text>
                                        <SettingsPanel setSettings={setSettings} settings={settings} />
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

                                            setSuccess("Reset calendar settings.")
                                        }}
                                        variant="warning"
                                    >
                                        Reset
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </div>
                <TrackerCalendar entries={entries} year={year} settings={settings} />
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
}

function SettingsPanel({
    settings,
    setSettings,
}: {
    settings: CalendarSettings;
    setSettings: setState<CalendarSettings>;
}) {
    return (
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
            <div className='w-100'></div>
            <ButtonGroup className='mt-2'>
                <ToggleButton
                    id="horizontal"
                    type="radio"
                    name="radio"
                    value={'horizontal'}
                    checked={settings.direction === 'horizontal'}
                    onChange={() => {
                        localStorage.removeItem('direction');
                        setSettings({ direction: 'horizontal', outlineMonths: settings.outlineMonths });
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
                        setSettings({ direction: 'vertical', outlineMonths: settings.outlineMonths });
                    }}
                    style={{ width: '100px' }}
                >
                    Vertical
                </ToggleButton>
            </ButtonGroup>
        </div>
    );
}

function TrackerCalendar({
    entries,
    year,
    settings,
}: {
    entries: Entry[];
    year: number;
    settings: CalendarSettings;
}) {
    return (
        <div
            style={{
                textAlign: 'center',
                width: '95%',
                height: settings.direction === 'vertical' ? '1500px' : '250px',
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
                monthLegend={(_year, _month, date) => {
                    return window.innerWidth > 550 ? date.toLocaleString('default', { month: 'short' }) : ''
                }}
                colors={[
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
                ]}
                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                monthBorderColor="#9cc3ff"
                monthBorderWidth={settings.outlineMonths ? 2 : 0}
                yearSpacing={40}
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
            />
        </div>
    );
}
