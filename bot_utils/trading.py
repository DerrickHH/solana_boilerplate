import requests
import pandas as pd
import asyncio
from bot_utils.log import log_general, log_transaction
from bot_utils.transaction import market, perform_swap
from bot_utils.config import config
from bot_utils.wallet import find_balance
from apscheduler.schedulers.background import BlockingScheduler
from bot_utils.indicators import calculate_rsi, calculate_bbands, calculate_ema

def fetch_candlestick() -> dict:
    url = "https://min-api.cryptocompare.com/data/v2/histominute"
    headers = {'authorization': config().api_key}
    params = {'fsym': config().other_mint_symbol, 'tsym': 'USD', 'limit': 50, 'aggregate': config().trading_interval_minutes}
    response = requests.get(url, headers=headers, params=params)
    if response.json().get('Response') == 'Error':
        log_general.error(response.json().get('Message'))
        exit()
    return response.json()

def perform_analysis():
    log_general.debug("Soltrade is analyzing the market; no trade has been executed.")
    global stoploss, takeprofit

    # 获取头寸数据
    market().load_position()
    # Converts JSON response for DataFrame manipulation
    candle_json = fetch_candlestick()
    candle_dict = candle_json["Data"]["Data"]

    # Creates dataframe for manipulation
    columns = ['close', 'high', 'low', 'open', 'time', 'VF', 'VT']
    df = pd.DataFrame(candle_dict, columns=columns)
    df['time'] = pd.to_datetime(df['time'], unit='s')

    # DataFrame variable for TA-Lib manipulation
    cl = df['close']

    # Technical analysis values used in trading algorithm
    price = cl.iat[-1]
    # 一般ema计算的跨度都是5天或者20天
    ema_short = calculate_ema(dataframe=df, length=5)
    ema_medium = calculate_ema(dataframe=df, length=20)
    rsi = calculate_rsi(dataframe=df, length=14)
    upper_bb, lower_bb = calculate_bbands(dataframe=df, length=14)
    # 获取止损
    stoploss = market().sl
    # 获取止盈
    takeprofit = market().tp

    log_general.debug(f"""
    price:                  {price}
    short_ema:              {ema_short}
    med_ema:                {ema_medium}
    upper_bb:               {upper_bb.iat[-1]}
    lower_bb:               {lower_bb.iat[-1]}
    rsi:                    {rsi}
    stop_loss               {stoploss}
    take_profit:            {takeprofit}
    """)

    # 没有头寸数据说明就没有任何的相关资产
    if not market().position:
        usdc_balance = find_balance(config().usdc_mint)
        # 计算交易金额，保留一位小数并减少 0.01 以确保足够的余额
        input_amount = round(usdc_balance, 1) - 0.01
        # 如果短期 EMA 高于中期 EMA 或价格低于布林带下轨且 RSI 小于等于 31，表示买入信号
        if (ema_short > ema_medium or price < lower_bb.iat[-1]) and rsi <= 31:
            log_transaction.info("Soltrade has detected a buy signal.")
            if input_amount <= 0 or input_amount >= usdc_balance:
                log_transaction.warning("Soltrade has detected a buy signal, but does not have enough USDC to trade.")
                return
            # 执行买入操作
            is_swapped = asyncio.run(perform_swap(input_amount, config().usdc_mint))
            if is_swapped:
                # 设置止损
                stoploss = market().sl = cl.iat[-1] * 0.925
                # 设置止盈
                takeprofit = market().tp = cl.iat[-1] * 1.25
                # 更新市场头寸
                market().update_position(True, stoploss, takeprofit)
            return


# This starts the trading function on a timer
def start_trading():
    log_general.info("Soltrade has now initialized the trading algorithm.")

    trading_sched = BlockingScheduler()
    trading_sched.add_job(perform_analysis, 'interval', seconds=config().price_update_seconds, max_instances=1)
    trading_sched.start()
    perform_analysis()