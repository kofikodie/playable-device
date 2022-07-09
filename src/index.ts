import app from './app';

(async () => {
    try {
        const appPort = process.env.APP_PORT || 8888;
        app.listen(appPort, () => {
            console.log(`App listening on port ${appPort}`);
        });
    } catch (err) { 
        console.error(err);
    }
})();
