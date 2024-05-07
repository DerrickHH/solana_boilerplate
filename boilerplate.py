import time
from solana.rpc.api import Client
from solders.keypair import Keypair
from solana.transaction import Transaction
from solders.system_program import TransferParams, transfer
import argparse

test_net = "https://api.testnet.solana.com"
dev_net = "https://api.devnet.solana.com"
amount = 1000000000  # 仅生成账户是需要使用


def create_account(mod):
    global client
    if mod == "test":
        client = Client(test_net)
    if mod == "dev":
        client = Client(dev_net)
    new_account = Keypair()
    print(new_account.pubkey(), new_account.secret())

    # 将生成内容写入 txt 中
    write_to_txt(new_account.pubkey(), new_account.secret())
    res = client.request_airdrop(new_account.pubkey(), amount)
    print("Air drop response: ", res)
    balance = client.get_balance(new_account.pubkey())
    print("Balance is: ", balance)


def import_account(file_path, mod):
    global client
    if mod == "test":
        client = Client(test_net)
    if mod == "dev":
        client = Client(dev_net)
    keypairs = []  # [0] is public key, [1] is private key
    with open(file_path, "r") as file:
        for line in file:
            line = line.strip()
            keypairs.append(line)
    b58_string = keypairs[1]
    keypair = Keypair.from_base58_string(b58_string)
    balance = client.get_balance(keypair.pubkey())
    print("Balance is: ", balance)


def send_transaction(from_path, to_path, mod):
    global client
    if mod == "test":
        client = Client(test_net)
    if mod == "dev":
        client = Client(dev_net)
    from_key = []
    with open(from_path, "r") as file:
        for line in file:
            line = line.strip()
            from_key.append(line)
    sender = Keypair.from_base58_string(from_key[1])
    from_balance = client.get_balance(sender.pubkey())
    print("Balance of sender is: ", from_balance)

    to_key = []
    with open(to_path, "r") as file:
        for line in file:
            line = line.strip()
            to_key.append(line)
    receiver = Keypair.from_base58_string(to_key[1])
    to_balance = client.get_balance(receiver.pubkey())
    print("Balance of receiver is: ", to_balance)

    amount = 10000

    transaction = Transaction().add(transfer(TransferParams(
        from_pubkey=sender.pubkey(),
        to_pubkey=receiver.pubkey(),
        lamports=amount,
    )))
    result = client.send_transaction(transaction, sender)
    print(result)

    time.sleep(10)

    from_balance = client.get_balance(sender.pubkey())
    print("After transfer, balance of sender is: ", from_balance)
    to_balance = client.get_balance(receiver.pubkey())
    print("After transfer, balance of receiver is: ", to_balance)


def write_to_txt(info1, info2):
    with open(f"{info1}.txt", "w") as file:
        file.write(str(info1) + "\n")
        file.write(str(info2) + "\n")


def main():
    parser = argparse.ArgumentParser(description="Interacting with solana.")
    parser.add_argument("--create", action="store_true", help="create a new account")
    parser.add_argument("--imports", metavar="FILE_PATH", help="get account from file")
    parser.add_argument("--mod", choices=["test", "dev", "mainnet"], help="please specify with test, dev or mainnet")

    args = parser.parse_args()

    if not args.mod:
        parser.error("Please specify mod.")
        return

    while True:
        command = input("Enter a command ('create', 'import', 'transfer', 'exit'): ")

        if command == "create":
            create_account(args.mod)

        elif command == "import":
            file_path = input("Enter file path: ")
            import_account(file_path, args.mod)

        elif command == "transfer":
            from_path = input("Enter sender file: ")
            to_path = input("Enter receiver file: ")
            send_transaction(from_path, to_path, args.mod)

        elif command == "exit":
            break

        else:
            print("Invalid command.")

    # if args.create:
    #     if not args.mod:
    #         parser.error("Please specify mod.")
    #         return
    #     create_account(args.mod)
    #
    # if args.imports:
    #     if not args.mod:
    #         parser.error("Please specify mod.")
    #         return
    #     import_account(args.imports, args.mod)


if __name__ == '__main__':
    main()