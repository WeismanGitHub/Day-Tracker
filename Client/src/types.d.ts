interface CustomError {
    title: string;
    detail: string;
    status: number;
}

type setError = React.Dispatch<SetStateAction<CustomError | null>>;
