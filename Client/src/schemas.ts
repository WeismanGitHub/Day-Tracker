import * as yup from 'yup';

const problemDetailsSchema = yup.object().shape({
    title: yup.string().required(),
    status: yup.number().required(),
    detail: yup.string().required(),
    traceId: yup.string().required(),
});

export { problemDetailsSchema };
