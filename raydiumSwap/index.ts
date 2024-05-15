
const swap = async () => {
    const raydiumSwap = new RaydiumSwap(process.env.RPC_URL, process.env.WALLET_PRIVATE_KEY);

    console.log(`Swapping ${swapConfig.tokenAAmount} of ${swapConfig.tokenAAddress} for ${swapConfig.tokenBAddress}...`);

    /**
     * Load pool keys from the Raydium API to enable finding pool information.
     */
    await raydiumSwap.loadPoolKeys(swapConfig.liquidityFile);
    console.log(`Loaded pool keys`);

    const poolInfo = raydiumSwap.findPoolInfoForTOkens(swapConfig.tokenAAddress, swapConfig.tokenBAddress);

    if (!poolInfo) {
        console.error('Pool info not founc');
        return 'Pool info not found';
    } else {
        console.log('Found pool info');
    }

    const tx = await raydiumSwap.getSwapTransaction(
        swapConfig.tokenBAddress,
        swapConfig.tokenAAmount,
        poolInfo,
        swapConfig.maxLamports,
        swapConfig.useVersionedTransaction,
        swapConfig.direction
    );

    if (swapConfig.executeSwap) {
        const txid = swapCOnfig.useVersionedTransaction ? await raydiumSwap.sendVersionedTransaction(tx as VersionedTransaction, swapConfig.maxRetries) : await raydiumSwap.sendLegancyTransaction(tx as Transaction, swapConfig.maxRetries);
        console.log(`https://solscan.io/tx/${txid}`);
    } else {
        const simRes = swapConfig.useVersionedTransaction ? await raydiumSwap.simulateVersionedTransaction(tx as VersionedTransaction) : await raydiumSwap.simulateLegacyTransaction(tx as Transaction);

        console.log(simRes);
    }
};

swap();