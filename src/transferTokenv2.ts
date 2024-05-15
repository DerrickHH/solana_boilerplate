import { getOrCreateAssociatedTokenAccount, createMint, mintTo, transfer } from '@solana/spl-token';
import { Connection, Keypair, LAMPORTS_PER_SOL, Transaction, sendAndConfirmTransaction, SystemProgram } from '@solana/web3.js';
import bs58 from "bs58";
const { decode } = bs58;


(async () => {
    const connection = new Connection("https://long-wild-snowflake.solana-testnet.quiknode.pro/97930ab1af818317ba8dd01ebf06d768e7a81f17/", 'confirmed');
    const toWallet = Keypair.fromSecretKey(
        // 替换私钥
        decode("Z9QXoFwTFUuxHjiQutuq6CKqecevKU4ovbnJEsLq6w6KzCtmVeWdjD356reb9YZe3F1DFKNe1Yvd9iYFCC5yutJ")
    );
    const wallet = Keypair.fromSecretKey(
        Uint8Array.from([107,87,102,94,207,172,166,98,95,184,90,25,48,94,14,103,57,98,43,76,203,37,153,59,163,23,101,2,193,111,86,19,234,51,120,161,101,67,33,168,254,189,223,161,169,183,50,39,61,237,25,95,147,102,204,124,194,79,236,31,190,144,42,169]),
    )
    console.log("The public key is: ", wallet.publicKey);

    // const transferTransaction = new Transaction().add(
    //     SystemProgram.transfer({
    //         fromPubkey: toWallet.publicKey,
    //         toPubkey: wallet.publicKey,
    //         lamports: 0.1 * LAMPORTS_PER_SOL,
    //     })
    // );

    // await sendAndConfirmTransaction(connection, transferTransaction, [toWallet]);

    // const airdropSignature = await connection.requestAirdrop(
    //     wallet.publicKey,
    //     LAMPORTS_PER_SOL
    // );
    
    // await connection.confirmTransaction(airdropSignature);

    const mint = await createMint(connection, wallet, wallet.publicKey, wallet.publicKey, 9);

    console.log(1);
    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey,
    );
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, wallet, mint, toWallet.publicKey, 
    );

    let signature = await mintTo(
        connection,
        wallet,
        mint,
        fromTokenAccount.address,
        wallet.publicKey,
        1000000000
    );
    console.log('mint tx:', signature);

    signature = await transfer(
        connection,
        wallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        wallet,
        500
    );

})();