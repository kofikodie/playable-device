import morgan from 'morgan';

export default morgan(
    ':method :url HTTP/:http-version :status :res[content-length] - :response-time ms'
);
