import app from "./app.ts";
import { connect } from "mongoose";
import { loggerInstance } from "./middleware/winston-logging.ts";
import { connectionString, port, serviceName } from "./config.ts";

(async () => {
    try {
        await connect(connectionString);
        app.listen(port);
        loggerInstance.log({
            level: "info",
            message: `${ serviceName } open for business at port ${ port }`
        });
    } catch (e) {
        console.log(e);
        loggerInstance.log({
            level: "error",
            message: `App start error in server.ts: ${e}`
        });
        process.exit(1);
    }
})();