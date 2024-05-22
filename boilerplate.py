from bot_utils.config import config
from bot_utils.log import log_general
from bot_utils.wallet import find_balance
from bot_utils.trading import start_trading

config_path = 'config.json'
config(config_path)


def check_json_state() -> bool:
    if config().keypair and config().other_mint:
        return True
    return False


# Prints "solshitcoinbot" and information about the connected wallet
print("""         Solana ShitCoin Auto-Trading|
""")
can_run = check_json_state()

# Error catching in case the program is unable to find the properties of the wallet
try:
    log_general.info(f"solshitcoinbot has detected {find_balance(config().other_mint)} {config().other_mint_symbol} tokens available for trading.")
except Exception as e:
    log_general.error(f"Error finding {config().other_mint_symbol} balance: {e}")
    exit()

# Checks if the run prompt should be displayed
if can_run:
    log_general.debug("solshitcoinbot has successfully imported the API requirements.")
    start_trading()
else:
    exit()

