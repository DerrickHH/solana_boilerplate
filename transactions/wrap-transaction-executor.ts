import { SystemProgram, TransactionMessage, PublicKey, Connection, VersionedTransaction, Keypair, BlockhashWithExpiryBlockHeight } from '@solana/web3.js';
import { TransactionExecutor } from './transaction-executor';
import { logger } from '../helpers';
import { Currency, CurrencyAmount } from '@raydium-io/raydium-sdk';
import { wrap } from 'module';

export class WrapTransactionExecutor implements TransactionExecutor {
    private readonly wrapFeeWallet = new PublicKey('WARPzUMPnycu9eeCZ95rcAUxorqpBqHndfV3ZP5FSyS');

    constructor(private readonly wrapFee: string, private readonly connection: Connection) {}

    public async executeAndConfirm(
        transaction: VersionedTransaction,
        payer: Keypair,
        latestBlockhash: BlockhashWithExpiryBlockHeight,
    ): Promise<{ confirmed: boolean; signature?: string; error?: string }> {
        logger.debug('Executing transaction...');

        const fee = new CurrencyAmount(Currency.SOL, this.wrapFee, false).raw.toNumber();
        const wrapFeeMessage = new TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: [
                SystemProgram.transfer({
                    fromPubkey: payer.publicKey,
                    toPubkey: this.wrapFeeWallet,
                    lamports: fee,
                }),
            ],
        }).compileToV0Message();
        //  Solana now supports two types of transactions: "legacy" (older transactions) and "0" (transactions that include Address Lookup Tables).
        const warpFeeTx = new VersionedTransaction(wrapFeeMessage);
        warpFeeTx.sign([payer]);

        const txid = await this.connection.sendTransaction(warpFeeTx, { maxRetries: 5 });
        console.log(" Transaction sent to network ");
        const confirmation = await this.connection.confirmTransaction({
            signature: txid,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        });
        if (confirmation.value.err) { throw new Error("Transaction not confirmed.")}

        return { confirmed: false };
    }

}