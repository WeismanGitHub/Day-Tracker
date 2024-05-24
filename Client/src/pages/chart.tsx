import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ResponsiveCalendar } from '@nivo/calendar';
import { useEffect, useState } from 'react';
import { handleErrors } from '../helpers';
import { chartSchema } from '../schemas';
import NavBar from '../navbar';
import axios from 'axios';
import { Breadcrumb, Toast, ToastContainer } from 'react-bootstrap';

interface Entry {
    id: string;
    year: number;
    month: number;
    day: number;
    rating?: number;
    count?: number;
    checked?: boolean
}

function getYear(paramsYear: string | null): number {
    const currentYear = new Date().getFullYear();
    const castYear = paramsYear ? Number(paramsYear) : currentYear

    return Number.isNaN(castYear) ? currentYear : castYear
}

export default function Chart() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [chart, setChart] = useState<Chart | null>(null);
    const { chartId } = useParams();
    const navigate = useNavigate();

    const [error, setError] = useState<CustomError | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [searchParams] = useSearchParams();
    const [year, setYear] = useState<number>(getYear(searchParams.get('year')))

    // Validate the year.
    if (chart && (year < new Date(chart.createdAt).getFullYear())) {
        setYear(new Date().getFullYear())
    }

    useEffect(() => {
        handleErrors(
            async () => {
                const [chartRes, entriesRes] = await Promise.all([
                    axios.get<Chart>(`/Api/Charts/${chartId}`),
                    axios.get<Entry[]>(`/Api/Charts/${chartId}/Entries?year=${year}`)
                ])

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

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar">
                <h4 className="ps-4 pt-2">
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/charts/${chartId}`}>{chart?.name}</Breadcrumb.Item>
                        <Breadcrumb.Item href={`/charts/${chartId}?year=${year}`}>{year}</Breadcrumb.Item>
                    </Breadcrumb>
                </h4>
                <div className="d-flex justify-content-center align-items-center">
                    <TrackerCalendar entries={entries} year={year}/>
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
}

function TrackerCalendar({ entries, year }: { entries: Entry[], year: number }) {
    return (
        <div style={{ textAlign: 'center', width: '600px', height: '400px' }}>
            <ResponsiveCalendar
                data={entries.map(e => {
                    const day = `${e.year}-${e.month}-${e.day}`
                    const value = e.checked !== null ? Number(e.checked) : e.count ?? e.rating

                    return { day, value: value ?? 0 }
                })}
                from={new Date(year, 0, 1, 0, 0, 0, 0)}
                to={new Date(year, 11, 31, 23, 59, 59, 999)}
                emptyColor="#eeeeee"
                colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
                margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
                yearSpacing={40}
                monthBorderColor="#ffffff"
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
