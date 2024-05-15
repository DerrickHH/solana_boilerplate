import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, createAccount, mintTo, getAccount, transfer } from '@solana/spl-token';
import bs58 from "bs58";
const { decode } = bs58;

(async () => {
    const connection = new Connection("https://long-wild-snowflake.solana-testnet.quiknode.pro/97930ab1af818317ba8dd01ebf06d768e7a81f17/", 'confirmed');
    const wallet = Keypair.fromSecretKey(
        // 替换私钥
        decode("Z9QXoFwTFUuxHjiQutuq6CKqecevKU4ovbnJEsLq6w6KzCtmVeWdjD356reb9YZe3F1DFKNe1Yvd9iYFCC5yutJ")
    );

    // 辅助账户
    // const auxilliaryKeypair = Keypair.generate();

    
    // console.log("The secret key is: ", auxilliaryKeypair.secretKey);

    const auxilliaryKeypair = Keypair.fromSecretKey(
        Uint8Array.from([107,87,102,94,207,172,166,98,95,184,90,25,48,94,14,103,57,98,43,76,203,37,153,59,163,23,101,2,193,111,86,19,234,51,120,161,101,67,33,168,254,189,223,161,169,183,50,39,61,237,25,95,147,102,204,124,194,79,236,31,190,144,42,169]),
    )
    console.log("The public key is: ", auxilliaryKeypair.publicKey);

    const airdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        LAMPORTS_PER_SOL,
    );

    await connection.confirmTransaction(airdropSignature);

    console.log("Got a airdrop.");

    const mint = await createMint(
        connection,
        wallet,
        wallet.publicKey,
        wallet.publicKey,
        9
    );

    // create custom token account
    const auxilliaryTokenAccount = await createAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey,
        auxilliaryKeypair,
    );

    const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey,
    );

    await mintTo(
        connection,
        wallet,
        mint,
        associatedTokenAccount.address,
        wallet,
        50
    )

    const accountInfo = await getAccount(connection, associatedTokenAccount.address);

    console.log(accountInfo.amount);

    await transfer(
        connection,
        wallet,
        associatedTokenAccount.address,
        auxilliaryTokenAccount,
        wallet,
        50
    );

    const auxAccountInfo = await getAccount(connection, auxilliaryTokenAccount);

    console.log(auxAccountInfo.amount);

})();