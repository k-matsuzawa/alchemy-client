import { Network, Alchemy } from 'alchemy-sdk'
import { program } from 'commander'

interface Setting {
    apiKey: string,
    network: Network,
}

const mumbaiSettings = {
    apiKey: "pkzCipYUqKV1Bwac5nUvVxsmjaRS9J_m",
    network: Network.MATIC_MUMBAI,
}

const goerliSettings = {
    apiKey: "G8NTnUQ6Nmr_CAdzFBYSEUbhrosPviQq",
    network: Network.ETH_GOERLI,
}

const main = async (network: string, command: string, addr: string, tx: string, contract: string) => {
    let setting: Setting = {apiKey: '', network: Network.ETH_GOERLI}
    switch (network) {
        case 'goerli':
            setting = goerliSettings
            break
        case 'mumbai':
            setting = mumbaiSettings
            break
        default:
            throw Error(`unsupported network, ${network}`)
    }
    console.log(`network: ${network}`)
    const alchemy = new Alchemy(setting)
    
    switch (command) {
        case 'getblocknumber':
            const latestBlock = await alchemy.core.getBlockNumber()
            console.log("Latest block number:", latestBlock)
            break
        case 'gettxcount':
            if (!addr) {
                throw Error('addr is empty')
            }
            const txcount = await alchemy.core.getTransactionCount(addr)
            console.log(`txcount:`, txcount)
            break
        case 'getbalance':
            if (!addr) {
                throw Error('addr is empty')
            }
            const balance = await alchemy.core.getBalance(addr, 'latest')
            console.log(`Balance:`, balance)
            console.log(`${balance.toBigInt()} wei`)
            break
        case 'gettokenbalance':
            if (!addr) {
                throw Error('addr is empty')
            }
            const tokenbalance = await alchemy.core.getTokenBalances(addr, [contract])
            console.log(`TokenBalance:`, tokenbalance)
            console.log(`${tokenbalance.tokenBalances[0].tokenBalance} wei`)
            break
        case 'sendtx':
            if (!tx) {
                throw Error('tx is empty')
            }
            if (!tx.startsWith('0x')) tx = '0x' + tx
            const sendTx = await alchemy.transact.sendTransaction(tx)
            console.log("sendTransaction: ", sendTx)
            const ret = await sendTx.wait()
            console.log("result: ", ret)
            break
        default:
            throw Error(`unsupported command, ${command}`)
    }
}

program
    .requiredOption('-n, --network <network>', 'target network', 'goerli')
    .requiredOption('-c, --command <command>', 'target command', 'getblocknumber')
    .option('-a, --addr <addr>', 'target address', '')
    .option('-t, --tx <tx>', 'send transaction', '')
    .option('-r, --contract <contractAddr>', 'contract address', '')
    .parse()
const options = program.opts()

main(options.network, options.command, options.addr, options.tx, options.contract)
