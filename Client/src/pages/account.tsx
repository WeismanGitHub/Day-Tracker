import NavBar from '../navbar';

export default function Account() {
    const [account, setAccount] = useState<Account | null>(null);
    const [error, setError] = useState<CustomError | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        (async function () {
            try {
                const res = await axios.get<Account>('/Api/Users/Account');

                if (!accountSchema.validateSync(res.data)) {
                    throw new Error();
                }

                setAccount(res.data);
            } catch (err) {
                if (
                    axios.isAxiosError<CustomError>(err) &&
                    problemDetailsSchema.isValidSync(err.response?.data)
                ) {
                    if (err.response.status == 401) {
                        return navigate('/auth');
                    }

                    setError(err.response.data);
                } else {
                    setError({
                        title: 'Unknown Error',
                        detail: 'Something went wrong!',
                        status: 500,
                    });
                }
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <NavBar />
            hello world
        </>
    );
}
