import pretty from "pino-pretty";

export default (opts: any) =>
  pretty({
    ...opts,
    messageFormat: (log, messageKey) => `hello ${log[messageKey]}`,
  });
