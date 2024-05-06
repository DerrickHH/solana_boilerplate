from solathon import Client, Keypair, PublicKey, Transaction
import argparse
from solathon.core.instructions import transfer
import os

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
    print(new_account.public_key, new_account.private_key)

    # 将生成内容写入 txt 中
    write_to_txt(new_account.public_key, new_account.private_key)
    res = client.request_airdrop(new_account.public_key, amount)
    print("Air drop response: ", res)
    balance = client.get_balance(new_account.public_key)
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
    public_key = PublicKey(keypairs[0])
    balance = client.get_balance(public_key)

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
    from_public_key = PublicKey(from_key[0])
    from_balance = client.get_balance(from_public_key)
    print("Balance of sender is: ", from_balance)
    sender = Keypair().from_private_key(from_key[1])

    to_key = []
    with open(to_path, "r") as file:
        for line in file:
            line = line.strip()
            to_key.append(line)
    to_public_key = PublicKey(to_key[0])
    to_balance = client.get_balance(to_public_key)
    print("Balance of receiver is: ", to_balance)

    amount = 10000

    instruction = transfer(
        from_public_key=sender.public_key,
        to_public_key=to_public_key,
        lamports=amount
    )
    transaction = Transaction(instructions=[instruction], signers=[sender])
    result = client.send_transaction(transaction)
    print(result)

    from_balance = client.get_balance(from_public_key)
    print("After transfer, balance of sender is: ", from_balance)
    to_balance = client.get_balance(to_public_key)
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
        command = input("Enter a command ('create', 'import', 'exit'): ")

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