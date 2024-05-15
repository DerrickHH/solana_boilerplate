import {NATIVE_MINT, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createSyncNativeInstruction, getAccount} from "@solana/spl-token";
import {clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction} from "@solana/web3.js";
import bs58 from "bs58";
const { decode } = bs58;

(async () => {
    const connection = new Connection("https://long-wild-snowflake.solana-testnet.quiknode.pro/97930ab1af818317ba8dd01ebf06d768e7a81f17/", 'confirmed');
    const wallet = Keypair.fromSecretKey(
        // 替换私钥
        Uint8Array.from([247,160,137,32,247,119,160,143,216,81,153,62,233,87,54,37,165,88,207,217,173,17,185,183,70,51,177,253,115,6,123,211,82,241,173,21,126,158,19,192,191,154,131,209,122,178,51,133,124,229,218,44,185,191,250,85,62,91,68,90,51,143,18,177]),
    );

    const airdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        1 * LAMPORTS_PER_SOL,
    );

    await connection.confirmTransaction(airdropSignature);

    const associatedTokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        wallet.publicKey
    )

    // Create token account to hold your wrapped SOL
    const ataTransaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
            wallet.publicKey,
            associatedTokenAccount,
            wallet.publicKey,
            NATIVE_MINT
        )
    );

    await sendAndConfirmTransaction(connection, ataTransaction, [wallet]);

    // Transfer SOL to associated token account and use SyncNative to update wrapped SOL balance
    const solTransferTransaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: associatedTokenAccount,
            lamports: 0.5 * LAMPORTS_PER_SOL
        }),
        createSyncNativeInstruction(
            associatedTokenAccount
        )
    )

    await sendAndConfirmTransaction(connection, solTransferTransaction, [wallet]);

    const accountInfo = await getAccount(connection, associatedTokenAccount);

    console.log(`Native: ${accountInfo.isNative}, Lamports: ${accountInfo.amount}`);

})();