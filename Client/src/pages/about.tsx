import { ResponsiveCalendar } from '@nivo/calendar';
import NavBar from '../navbar';

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

export default function About() {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <NavBar />
            <div className="d-flex justify-content-center align-items-center full-height-minus-navbar">
                <div
                    style={{
                        textAlign: 'center',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                    }}
                    className="example-calendar"
                >
                    <div
                        style={{
                            minWidth: '725px',
                            height: '175px',
                        }}
                    >
                        <ResponsiveCalendar
                            data={[]}
                            theme={{ labels: { text: { fontSize: 'large' } } }}
                            from={new Date(currentYear, 0, 1, 0, 0, 0, 0)}
                            to={new Date(currentYear, 11, 31, 23, 59, 59, 999)}
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
                    <div
                        style={{
                            minWidth: '725px',
                            height: '175px',
                        }}
                        className="example-calendar"
                    >
                        <ResponsiveCalendar
                            data={[]}
                            theme={{ labels: { text: { fontSize: 'large' } } }}
                            from={new Date(currentYear, 0, 1, 0, 0, 0, 0)}
                            to={new Date(currentYear, 11, 31, 23, 59, 59, 999)}
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
                    <div
                        style={{
                            minWidth: '725px',
                            height: '175px',
                        }}
                        className="example-calendar"
                    >
                        <ResponsiveCalendar
                            data={[]}
                            theme={{ labels: { text: { fontSize: 'large' } } }}
                            from={new Date(currentYear, 0, 1, 0, 0, 0, 0)}
                            to={new Date(currentYear, 11, 31, 23, 59, 59, 999)}
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
            </div>
        </>
    );
}
