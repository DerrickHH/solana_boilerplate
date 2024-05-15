import { Connection, Keypair, LAMPORTS_PER_SOL  } from '@solana/web3.js';
import { createMint, getAccount, getMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import bs58 from "bs58";
const { decode } = bs58;

(async () => {
    const connection = new Connection("https://long-wild-snowflake.solana-testnet.quiknode.pro/97930ab1af818317ba8dd01ebf06d768e7a81f17/", 'confirmed');
    const wallet = Keypair.fromSecretKey(
        // 替换私钥
        decode("Z9QXoFwTFUuxHjiQutuq6CKqecevKU4ovbnJEsLq6w6KzCtmVeWdjD356reb9YZe3F1DFKNe1Yvd9iYFCC5yutJ")
    );

    const mint = await createMint(
        connection,
        wallet,
        wallet.publicKey,
        wallet.publicKey,
        9
    );

    console.log(mint.toBase58());

    const mintInfo = await getMint(
        connection,
        mint,
    );

    console.log(mintInfo.supply);

    // First create an account to hold a balance of the new token
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey,
    );

    console.log(tokenAccount.address.toBase58());

    await mintTo(
        connection,
        wallet,
        mint,
        tokenAccount.address,
        wallet,
        100000000000 // because decimals for the mint are set to 9 
      );

      const mintedInfo = await getMint(
        connection,
        mint
      )
      
      console.log(mintedInfo.supply);
      // 100
      
      const tokenAccountInfo = await getAccount(
        connection,
        tokenAccount.address
      )
      
      console.log(tokenAccountInfo.amount);
      // 100

})();