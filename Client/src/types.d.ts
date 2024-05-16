interface CustomError {
    title: string;
    detail: string;
    status: number;
}

type setState<T> = React.Dispatch<SetStateAction<T>>;
type setError = setState<CustomError | null>;