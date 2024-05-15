import * as yup from 'yup';

const problemDetailsSchema = yup.object().shape({
    title: yup.string().required(),
    status: yup.number().required(),
    detail: yup.string().required(),
    traceId: yup.string().required(),
});

const passwordSchema = yup
    .string()
    .required('Password is a required field.')
    .min(10, 'Must be at least 10 characters.')
    .max(70, 'Cannot be more than 70 characters.')
    .matches(/[A-Z]/, 'Missing an uppercase letter.')
    .matches(/([a-z])/, 'Missing a lower case letter.')
    .matches(/(\d)/, 'Missing a number.');

const nameSchema = yup
    .string()
    .required('Name is a required field.')
    .min(1, 'Must be at least 1 character.')
    .max(50, 'Cannot be more than 50 characters.');

export { problemDetailsSchema, passwordSchema, nameSchema };
