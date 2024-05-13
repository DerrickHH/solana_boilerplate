import { Commitment, Connection, PublicKey } from '@solana/web3.js';
import { GetStructureSchema, MARKET_STATE_LAYOUT_V3, publicKey, struct } from '@raydium-io/raydium-sdk';

export const MINIMAL_MARKET_STATE_LAYOUT_V3 = struct([publicKey('eventQueue'), publicKey('bids'), publicKey('asks')]);
export type MinimalMarketStateLayoutV3 = typeof MINIMAL_MARKET_STATE_LAYOUT_V3;
export type MinimalMarketLayoutV3 = GetStructureSchema<MinimalMarketStateLayoutV3>;

export async function getMinimalMarketV3(
    connection: Connection,
    marketId: PublicKey,
    commitment?: Commitment,
): Promise<MinimalMarketLayoutV3> {
    // Fetch all the account info for the specified public key
    const marketInfo = await connection.getAccountInfo(marketId, {
        commitment,
        // The returned account data using the provided offset: 'usize' and length: 'usize' fields; only available for base58, base64, or base64+zstd encodings
        dataSlice: {
            offset: MARKET_STATE_LAYOUT_V3.offsetOf('eventQueue'),
            length: 32 * 3,
        }
    });

    return MINIMAL_MARKET_STATE_LAYOUT_V3.decode(marketInfo!.data);
}