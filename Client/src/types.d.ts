interface CustomError {
    title: string;
    detail: string;
    status: number;
}

type setState<T> = React.Dispatch<SetStateAction<T>>;
type setError = setState<CustomError | null>;

interface Chart {
    id: string;
    name: string;
    type: number;
    createdAt: Date;
}
