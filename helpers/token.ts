import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Token } from '@raydium-io/raydium-sdk';

export function getToken(token: string) {
    switch (token) {
        case 'WSOL': {
            return Token.WSOL;
        }
        case 'USDC': {
            return new Token(
                TOKEN_PROGRAM_ID,
                // USDC 默认地址 (https://solscan.io/account/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v?cluster=testnet)
                new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
                6,
                'USDC',
                'USDC',
            );
        }
        default: {
            throw new Error(`Unsupported quote mint "${token}". Supported values are USDC and WSOL`);
        }
    }
}