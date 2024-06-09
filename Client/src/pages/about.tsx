import { ResponsiveCalendar } from '@nivo/calendar';
import { colors } from '../helpers';
import { useEffect } from 'react';
import NavBar from '../navbar';

const currentYear = new Date().getFullYear();
const start = new Date(currentYear, 0, 1, 0, 0, 0, 0);
const end = new Date(currentYear, 11, 31, 23, 59, 59, 999);

function randomDay(): string {
    const day = new Date(start.getTime() + (Math.random() * (end.getTime() - start.getTime())));
    
    return `${day.getFullYear()}-${(day.getMonth() + 1).toString().padStart(2, '0')}-${(day.getDate() + 1).toString().padStart(2, '0')}`;
}

export default function About() {
    useEffect(() => {
        setTimeout(() => {
            document.querySelectorAll('rect').forEach(rect => rect.style.cursor = 'default');
        }, 250)
    }, [])

    return (
        <>
            <NavBar />
            <div className="full-height-minus-navbar">
                <div
                    style={{
                        textAlign: 'center',
                        overflowX: 'auto',
                        overflowY: 'hidden',
                        minHeight: '200px',
                        height: '30%',
                        width: '90%',
                        minWidth: '300px',
                    }}
                    className='d-flex justify-content-center w-100 overflow-hidden'
                >
                    <ResponsiveCalendar
                        data={Array(365)
                            .fill(null)
                            .map(() => {
                                return {
                                    value: Math.floor(Math.random() * 10),
                                    day: randomDay()
                                };
                            })}
                        theme={{ labels: { text: { fontSize: 'large' } } }}
                        from={start}
                        to={end}
                        monthLegend={(_year: number, _month: number, date: Date) => {
                            if (window.innerWidth >= 700) {
                                return date.toLocaleString('default', { month: 'short' })
                            }

                            return ""
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
