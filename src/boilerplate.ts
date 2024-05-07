import { Command } from 'commander';
import inquirer from 'inquirer';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import fs from 'fs';
import readline from 'readline';
import * as bs58 from "bs58";


const program = new Command();

program.option('--create', 'create a new account').option('--imports <filePath>', 'get account from file').option('--mod <mode>', 'please specify with test, dev, or mainnet');

program.parse(process.argv);

const options = program.opts();

if (!options.mod) {
    console.error("Please specify mod.");
    process.exit(1);
}

async function createAccount(mod: string) {
    let connection: Connection;
    if (mod === "test") {
        connection = new Connection(clusterApiUrl("testnet"), "confirmed");
    } else if (mod === "dev") {
        connection = new Connection(clusterApiUrl("testnet"), "confirmed");
    } else if (mod === "mainnet") {
        connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    } else {
        console.error("Invalid mod value");
        return;
    }
    
    const wallet = Keypair.generate();
    let encoded = bs58.encode(wallet.secretKey);
    console.log("Encoded content is: ", encoded);
    fs.writeFile(`${wallet.publicKey}.txt`, `${wallet.publicKey}\n${encoded}\n`, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File has been written successfully.');
        }
    });

    connection.onAccountChange(
        wallet.publicKey,
        (updatedAccountInfo, context) =>
            console.log("Updated account info: ", updatedAccountInfo),
        "confirmed"
    );

    const signature = await connection.requestAirdrop(
        wallet.publicKey,
        LAMPORTS_PER_SOL
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });

    let balance = connection.getBalance(wallet.publicKey);
    console.log("Balance is: ", balance);
}

async function importAccount(filePath: string, mod: string) {
    let connection: Connection;
    if (mod === "test") {
        connection = new Connection(clusterApiUrl("testnet"), "confirmed");
    } else if (mod === "dev") {
        connection = new Connection(clusterApiUrl("testnet"), "confirmed");
    } else if (mod === "mainnet") {
        connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    } else {
        console.error("Invalid mod value");
        return;
    }
    let lines: any[] = [];
    if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        
        rl.on('line', (line) => {
            lines.push(line);
        });
    } else {
        console.log('File does not exist.');
    }

    const keypair = Keypair.fromSecretKey(
        bs58.decode(
            lines[1],
        )
    );

    let balance = connection.getBalance(keypair.publicKey);
    console.log("Balance is: ", balance);
}

export async function sendTransaction(fromPath: string, toPath: string, mod: string) {
    let connection: Connection;
    if (mod === "test") {
        connection = new Connection(clusterApiUrl("testnet"), "confirmed");
    } else if (mod === "dev") {
        connection = new Connection(clusterApiUrl("testnet"), "confirmed");
    } else if (mod === "mainnet") {
        connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
    } else {
        console.error("Invalid mod value");
        return;
    }

    let from: any[] = [];
    if (fs.existsSync(fromPath)) {
        const fileStream = fs.createReadStream(fromPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        
        rl.on('line', (line) => {
            from.push(line);
        });
    } else {
        console.log('From file does not exist.');
    }

    let to: any[] = [];
    if (fs.existsSync(toPath)) {
        const fileStream = fs.createReadStream(toPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        
        rl.on('line', (line) => {
            to.push(line);
        });
    } else {
        console.log('File does not exist.');
    }

    const sender = Keypair.fromSecretKey(
        bs58.decode(
            from[1],
        )
    );
    const receiver = Keypair.fromSecretKey(
        bs58.decode(
            to[1],
        )
    );

    let balance = await connection.getBalance(sender.publicKey);
    if (balance < 1000000) {
        console.error("No sufficient balance.");
    }

    const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: sender.publicKey,
            toPubkey: receiver.publicKey,
            lamports: 1000000,
        })
    );

    await sendAndConfirmTransaction(connection, transferTransaction, [
        sender,
    ]);
}

export async function main() {
    while (true) {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'command',
                message: 'Enter a command',
                choices: ['create', 'import', 'transfer', 'exit'],
            }
        ]);

        switch (answers.command) {
            case 'create':
                createAccount(options.mod);
                break;
            case 'import':
                const { filePath } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'filePath',
                        message: 'Enter file path:',
                    }
                ]);
                importAccount(filePath, options.mod);
                break;
            case 'transfer':
                const { fromPath, toPath } = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'fromPath',
                        message: 'Enter sender file:',
                    },
                    {
                        type: 'input',
                        name: 'toPath',
                        message: 'Enter receiver file:',
                    }
                ]);
                sendTransaction(fromPath, toPath, options.mod);
                break;
            case 'exit':
                return;
            default:
                console.log("Invalid command.");
                break;
        }
    }
}

main().catch(err => console.error(err));