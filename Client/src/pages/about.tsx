import { Card, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import Example from '../example';
import NavBar from '../navbar';

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
                                            contributions calendar. Input custom data into calendar heatmaps
                                            to visualize and analyze patterns over time. Easily track metrics
                                            such as daily exercise minutes, study hours, mood levels, and
                                            more.
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
                <Example />
            </div>
        </>
    );
}
