import { Card, Col, Container, Row } from 'react-bootstrap';
import { ResponsiveCalendar } from '@nivo/calendar';
import { Link } from 'react-router-dom';
import { colors } from '../helpers';
import { useEffect } from 'react';
import NavBar from '../navbar';

const currentYear = new Date().getFullYear();
const start = new Date(currentYear, 0, 1, 0, 0, 0, 0);
const end = new Date(currentYear, 11, 31, 23, 59, 59, 999);

function randomDay(): string {
    const day = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    return `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${(day.getDate() + 1).toString().padStart(2, '0')}`;
}

export default function About() {
    useEffect(() => {
        setTimeout(() => {
            document.querySelectorAll('rect').forEach((rect) => (rect.style.cursor = 'default'));
        }, 250);
    }, []);

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar">
                <Container className="mt-5">
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <Card>
                                <Card.Header className="bg-primary text-white" as="h1">
                                    About Day Tracker
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <h3>What is It?</h3>
                                        <p>
                                            Day Tracker is a visualization tool inspired by the GitHub
                                            contributions calendar, allowing you to input your own data into
                                            custom calendar heatmaps. This app provides an intuitive way to
                                            visualize and analyze patterns over time, making it easy to track
                                            metrics such as daily exercise minutes, study hours, mood levels,
                                            or whether you completed a task.
                                        </p>
                                        <h3>How Does It Work?</h3>
                                        <ul>
                                            <li>
                                                <strong>Input Data</strong>: You can input numerical data for
                                                each day of the year. This data can represent anything you
                                                want to track, such as study hours, sales numbers and more.
                                            </li>
                                            <li>
                                                <strong>Visualize Patterns</strong>: The calendar heatmap
                                                visualizes your data by associating higher numbers with darker
                                                colors. This makes it simple to identify trends and patterns
                                                at a glance.
                                            </li>
                                            <li>
                                                <strong>Calendar Types</strong>: There are three different
                                                calendar types: scale, checkmark, and counter. These types
                                                apply different restrictions on the values you can set for a
                                                day. Counters have no restrictions, checkmarks are true/false,
                                                and scales are 1-10.
                                            </li>
                                        </ul>
                                        <p>
                                            Visit the{' '}
                                            <Link to="https://github.com/WeismanGitHub/Day-Tracker">
                                                GitHub repository
                                            </Link>{' '}
                                            for the source code, or check out the{' '}
                                            <Link to="/swagger/index.html">Swagger documentation</Link> to see
                                            how the API works.
                                        </p>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                <div
                    style={{
                        textAlign: 'center',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                    }}
                >
                    <div
                        style={{
                            minWidth: '725px',
                            height: '175px',
                        }}
                    >
                        <ResponsiveCalendar
                            data={Array(365)
                                .fill(null)
                                .map(() => {
                                    return {
                                        value: Math.floor(Math.random() * 10) + 1,
                                        day: randomDay(),
                                    };
                                })}
                            theme={{ labels: { text: { fontSize: 'large' } } }}
                            from={start}
                            to={end}
                            monthLegend={(_year: number, _month: number, date: Date) => {
                                if (window.innerWidth >= 700) {
                                    return date.toLocaleString('default', { month: 'short' });
                                }

                                return '';
                            }}
                            emptyColor="#eeeeee"
                            direction={'horizontal'}
                            colors={colors}
                            margin={{ top: 40, right: 50, bottom: 2, left: 50 }}
                            monthBorderColor="#9cc3ff"
                            monthBorderWidth={0}
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
                        />
                    </div>
                </div>
                <ColorScale />
            </div>
        </>
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
