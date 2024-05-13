import { Connection } from '@solana/web3.js';
import {
    RPC_ENDPOINT,
    RPC_WEBSOCKET_ENDPOINT,
    TRANSACTION_EXECUTOR,
    COMMITMENT_LEVEL,
    LOG_LEVEL,
    logger,
    PRIVATE_KEY,
    QUOTE_MINT,
    getWallet,
    getToken,
    CUSTOM_FEE,
} from './helpers';
import { MarketCache, PoolCache } from './cache';
import {
    TransactionExecutor,
    DefaultTransactionExecutor,
    WrapTransactionExecutor,
} from './transactions';

const connection = new Connection(RPC_ENDPOINT, {
    wsEndpoint: RPC_WEBSOCKET_ENDPOINT,
    commitment: COMMITMENT_LEVEL,
})

const runListener = async() => {
    logger.level = LOG_LEVEL;
    logger.info('Bot is starting...');

    const marketCache = new MarketCache(connection);
    const poolCache = new PoolCache();
    let txExecutor: TransactionExecutor;

    switch (TRANSACTION_EXECUTOR) {
        case 'wrap': {
            txExecutor = new WrapTransactionExecutor(CUSTOM_FEE, connection);
            break;
        }
        default: {
            txExecutor = new DefaultTransactionExecutor(connection);
            break;
        }
    }
    const wallet = getWallet(PRIVATE_KEY.trim());
    const quoteToken = getToken(QUOTE_MINT);
}

runListener();