import pino from 'pino';

const transport = pino.transport({
    target: 'pion-pretty',
});

export const logger = pino (
    {
        level: 'info',
        redact: ['poolKeys'],
        serializers: {
            error: pino.stdSerializers.err,
        },
        base: undefined,
    },
    transport,
); 