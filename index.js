const { ethers } = require('ethers');
const colors = require('colors');
const fs = require('fs');
const readlineSync = require('readline-sync');

const checkBalance = require('./balance/balance');
const displayHeader = require('./display/display');
const sleep = require('./stoped/sleep');
const tsconfig = "";
const { start } = require('repl');

const rpcUrl = 'https://1rpc.io/sepolia	';

const MAX_RETRIES = 3;
const RETRY_DELAY = 21000;

async function retry(fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 2) throw error;
      console.log(
        colors.yellow(`Error occurred. Retrying... (${i + 1}/${maxRetries})`)
      );
      await sleep(delay);
    }
  }
}

const main = async () => {
  displayHeader();

  const privateKeys = JSON.parse(fs.readFileSync('privateKeys.json'));

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  for (const privateKey of privateKeys) {
    const wallet = new ethers.Wallet(privateKey, provider);
    const senderAddress = wallet.address;

    console.log(
      colors.bgBlack(`Processing transactions for address: ${senderAddress}`)
    );

    let senderBalance;
    try {
      senderBalance = await retry(() => checkBalance(provider, senderAddress));
    } catch (error) {
      console.log(
        colors.red(
          `Failed to check balance for ${senderAddress}. Skipping to next address.`
        )
      );
      continue;
    }

    if (senderBalance < ethers.parseUnits('0.0001', 'ether')) {
      console.log(
        colors.red('CHECK YOUR BALANCE . Skipping to next address.')
      );
      continue;
    }

    let continuePrintingBalance = true;
    const printSenderBalance = async () => {
      while (continuePrintingBalance) {
        try {
          senderBalance = await retry(() =>
            checkBalance(provider, senderAddress)
          );
          console.log(
            colors.bgMagenta(
              `Current Balance: ${ethers.formatUnits(
                senderBalance,
                'ether'
              )} ETH`
            )
          );
          if (senderBalance < ethers.parseUnits('0.00001', 'ether')) {
            console.log(colors.red('Insufficient balance for transactions.'));
            continuePrintingBalance = false;
          }
        } catch (error) {
          console.log(colors.red(`STOP-YOUR-BOT-USE-CTRL+C: ${error.message}`));
        }
      }
    };

    printSenderBalance();

    const transactionCount = readlineSync.questionInt(
      colors.bgRed(
      `YOUR TRANSACTION NEEDS { NUMBER }: `
     )
    );

    for (let i = 1; i <= transactionCount; i++) {
      const receiverWallet = ethers.Wallet.createRandom();
      const receiverAddress = receiverWallet.address;
      console.log(colors.white(`\nGenerated address ${i}: ${receiverAddress}`));

      const amountToSend = ethers.parseUnits(
        (Math.random() * (0.00001 - 0.000001) + 0.0000001)
          .toFixed(10)
          .toString(),
        'ether'
      );

      const gasPrice = ethers.parseUnits(
        (Math.random() * (170 - 80) + 30).toFixed(9).toString(),
        'gwei'
      );

      const transaction = {
        to: receiverAddress,
        value: amountToSend,
        gasLimit: 21000,
        gasPrice: gasPrice,
        chainId: 11155111,
      };

      let tx;
      try {
        tx = await retry(() => wallet.sendTransaction(transaction));
      } catch (error) {
        console.log(colors.red(`Failed to send transaction: ${error.message}`));
        continue;
      }

      console.log(colors.white(`Transaction ${i}:`));
      console.log(colors.white(`  Hash: ${colors.green(tx.hash)}`));
      console.log(colors.white(`  From: ${colors.green(senderAddress)}`));
      console.log(colors.white(`  To: ${colors.green(receiverAddress)}`));
      console.log(
        colors.white(
          `  Amount: ${colors.green(
            ethers.formatUnits(amountToSend, 'ether')
          )} ETH`
        )
      );
      console.log(
        colors.white(
          `  Gas Price: ${colors.green(
            ethers.formatUnits(gasPrice, 'gwei')
          )} Gwei`
        )
      );

      await sleep(22000)

      let receipt;
      try {
        receipt = await retry(() => provider.getTransactionReceipt(tx.hash));
        if (receipt) {
          if (receipt.status === 1) {
            console.log(colors.green('Transaction Success!'));
            console.log(colors.green(`  Block Number: ${receipt.blockNumber}`));
            console.log(
              colors.green(`  Gas Used: ${receipt.gasUsed.toString()}`)
            );
          } else {
            console.log(colors.red('Transaction FAILED'));
          }
        } else {
          console.log(
            colors.bgGreen(
              'Transaction DONE check on explorer.'
            )
          );
        }
      } catch (error) {
        console.log(
          colors.red(`Error checking transaction status: ${error.message}`)
        );
      }

      console.log();
    }

    console.log(
      colors.bgGreen(`FINISH YOUR TX TOTAL FINISH YOUR TX TOTAL FINISH YOUR TX TOTAL FINISH YOUR TX TOTAL FINISH YOUR TX TOTAL: ${senderAddress}`)
    );
  }
};

main().catch((error) => {
  console.error(colors.red('An unexpected error occurred:'), error);
});