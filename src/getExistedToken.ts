import { Connection, Keypair, PublicKey, Transaction, SystemProgram, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { getMint, mintToChecked, getOrCreateAssociatedTokenAccount, createTransferCheckedInstruction, getAccount } from '@solana/spl-token';
import bs58 from "bs58";
const { decode } = bs58;

(async () => {
    const connection = new Connection("https://long-wild-snowflake.solana-testnet.quiknode.pro/97930ab1af818317ba8dd01ebf06d768e7a81f17/", 'confirmed');
    const wallet = Keypair.fromSecretKey(
        // 替换私钥
        decode("Z9QXoFwTFUuxHjiQutuq6CKqecevKU4ovbnJEsLq6w6KzCtmVeWdjD356reb9YZe3F1DFKNe1Yvd9iYFCC5yutJ")
    );
    const toWallet = Keypair.fromSecretKey(
        Uint8Array.from([107,87,102,94,207,172,166,98,95,184,90,25,48,94,14,103,57,98,43,76,203,37,153,59,163,23,101,2,193,111,86,19,234,51,120,161,101,67,33,168,254,189,223,161,169,183,50,39,61,237,25,95,147,102,204,124,194,79,236,31,190,144,42,169]),
    )
    console.log("The public key is: ", toWallet.publicKey);

    // get an existed token
    // 自己创建的 
    const mintAccountPublicKey = new PublicKey("Gp5HopDyHNqUV6ouYGyao4KuPmR72L6TZa9CDyvYbGbY");
    // 必须是自己创建的 SPL token 地址
    // const mintAccountPublicKey = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
    let mintAccount = await getAccount(connection, mintAccountPublicKey);
    // let mintAccount = await getMint(connection, mintAccountPublicKey);
    console.log(mintAccount);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintAccount.address,
        // mintAccountPublicKey,
        wallet.publicKey,
    );
    console.log("1");

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mintAccount.address,
        toWallet.publicKey,
    );
    console.log("2");

    // let signature = await mintTo(
    //     connection,
    //     wallet,
    //     mint,
    //     fromTokenAccount.address,
    //     wallet.publicKey,
    //     1000000000
    // );

    let txhash = await mintToChecked(
        connection,
        wallet,
        mintAccount.address,
        fromTokenAccount.address,
        mintAccountPublicKey,
        // wallet.publicKey,
        5e9,
        9
    );
    console.log('mint tx:', txhash);

    //  TODO: V2: changed to versioned transaction
    // {
    //     let tx = new Transaction().add(
    //         createTransferCheckedInstruction(
    //             fromTokenAccount.address,
    //             mintAccount.address,
    //             toTokenAccount.address,
    //             toWallet.publicKey,
    //             1e8,
    //             9
    //         )
    //     ); 
    //     // Instead, call sendTransaction with a * VersionedTransaction
    //     console.log(
    //         `txhash: ${await connection.sendTransaction(tx, [
    //             wallet,
    //             toWallet,
    //         ])}`
    //     );
    // }

    // signature = await transfer(
    //     connection,
    //     wallet,
    //     fromTokenAccount.address,
    //     toTokenAccount.address,
    //     wallet,
    //     500
    // );
    // step 0  build an tx instruction
    const instruction: TransactionInstruction[] = [
        createTransferCheckedInstruction(
            fromTokenAccount.address,
            mintAccount.address,
            toTokenAccount.address,
            wallet.publicKey,
            8e8,
            9
        )
    ];

    // step 1  fetch latest blockhash
    let latestBlockhash = await connection.getLatestBlockhash('confirmed');
    console.log("   ✅ - Fetched latest blockhash. Last Valid Height:", latestBlockhash.lastValidBlockHeight);

    // step 2 generate transaction message
    const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: instruction
    }).compileToV0Message();
    console.log("   ✅ - Compiled Transaction Message");
    const transaction = new VersionedTransaction(messageV0);

    // Step 3 - Sign your transaction with the required `Signers`
    transaction.sign([wallet]);
    console.log("   ✅ - Transaction Signed");

    // step 4 Send our v0 transaction to the cluster
    const txid = await connection.sendTransaction(transaction, { maxRetries: 5 });
    console.log("   ✅ - Transaction sent to network");

    // step 5 Confirm Transaction 
    const confirmation = await connection.confirmTransaction({
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    })
    if (confirmation.value.err) { throw new Error("   ❌ - Transaction not confirmed.") }
    console.log('🎉 Transaction Succesfully Confirmed!', '\n', `https://explorer.solana.com/tx/${txid}?cluster=testnet`);

})();